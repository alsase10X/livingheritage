import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/app/(auth)/auth";
import { createClient as createAdminClient } from "@supabase/supabase-js";

const FileSchema = z.object({
  file: z
    .instanceof(Blob)
    .refine((file) => file.size <= 10 * 1024 * 1024, {
      message: "El tamaño del archivo debe ser menor a 10MB",
    })
    .refine(
      (file) =>
        [
          "image/jpeg",
          "image/jpg",
          "image/png",
          "image/webp",
          "image/gif",
        ].includes(file.type),
      {
        message: "El tipo de archivo debe ser JPEG, PNG, WebP o GIF",
      }
    ),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: bienId } = await params;

    // Verificar autenticación con NextAuth (usado en el panel)
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    if (request.body === null) {
      return NextResponse.json(
        { error: "El cuerpo de la petición está vacío" },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No se proporcionó ningún archivo" },
        { status: 400 }
      );
    }

    // Validar archivo
    const fileBlob = new Blob([file], { type: file.type });
    const validatedFile = FileSchema.safeParse({ file: fileBlob });

    if (!validatedFile.success) {
      const errorMessage = validatedFile.error.errors
        .map((error) => error.message)
        .join(", ");

      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    // Generar nombre único para el archivo
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 9);
    const fileExtension = file.name.split(".").pop() || "jpg";
    const filename = `bienes/${bienId}/${timestamp}-${randomId}.${fileExtension}`;

    try {
      // Usar service role key para operaciones administrativas del panel
      if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        return NextResponse.json(
          { error: "SUPABASE_SERVICE_ROLE_KEY no está configurada. Necesaria para operaciones administrativas." },
          { status: 500 }
        );
      }

      const adminClient = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
        }
      );

      // Subir a Supabase Storage
      const uploadResult = await adminClient.storage
        .from("imagenes-bienes")
        .upload(filename, file, {
          contentType: file.type,
          upsert: false,
        });

      if (uploadResult.error) {
        console.error("Error al subir imagen a Supabase Storage:", uploadResult.error);
        
        // Mensaje más útil si el bucket no existe
        if (uploadResult.error.message.includes("Bucket not found") || 
            uploadResult.error.message.includes("not found") ||
            uploadResult.error.message.includes("The resource was not found")) {
          return NextResponse.json(
            { 
              error: "El bucket 'imagenes-bienes' no existe. Ejecuta: pnpm run storage:create-bucket" 
            },
            { status: 500 }
          );
        }
        
        return NextResponse.json(
          { error: `Error al subir la imagen: ${uploadResult.error.message}` },
          { status: 500 }
        );
      }

      // Obtener URL pública de la imagen
      const {
        data: { publicUrl },
      } = adminClient.storage.from("imagenes-bienes").getPublicUrl(filename);

      return NextResponse.json({
        url: publicUrl,
        filename: uploadResult.data.path,
      });
    } catch (error) {
      console.error("Error al subir imagen:", error);
      return NextResponse.json(
        { error: `Error al subir la imagen: ${error instanceof Error ? error.message : "Error desconocido"}` },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error en upload de imagen:", error);
    return NextResponse.json(
      { error: "Error al procesar la petición" },
      { status: 500 }
    );
  }
}

