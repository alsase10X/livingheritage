import Link from "next/link";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { EditorBien } from "./editor-bien";

async function CargarBien({ id }: { id: string }) {
  const supabase = await createClient();

  const { data: bien, error } = await supabase
    .from("bienes")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !bien) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-red-600">
          {error
            ? `Error al cargar el bien: ${error.message}`
            : "Bien no encontrado"}
        </div>
        <Link
          href="/panel/bienes"
          className="text-blue-600 hover:underline mt-4 inline-block"
        >
          ← Volver a bienes
        </Link>
      </div>
    );
  }

  // Cargar imágenes del bien
  const { data: imagenes } = await supabase
    .from("imagenes_bienes")
    .select("*")
    .eq("bien_id", id)
    .order("orden", { ascending: true });

  return <EditorBien bien={bien} imagenes={imagenes || []} />;
}

function EditorSkeleton() {
  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-6" />
        <div className="h-10 bg-gray-200 rounded w-full mb-4" />
        <div className="h-96 bg-gray-100 rounded" />
      </div>
    </div>
  );
}

export default async function EditorBienPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <Suspense fallback={<EditorSkeleton />}>
      <CargarBien id={id} />
    </Suspense>
  );
}
