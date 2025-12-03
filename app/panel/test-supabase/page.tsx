import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";

async function TestSupabaseContent() {
  const resultados: Array<{
    titulo: string;
    estado: "success" | "error" | "warning";
    mensaje: string;
  }> = [];

  // 1. Verificar variables de entorno
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl) {
    resultados.push({
      titulo: "Variable NEXT_PUBLIC_SUPABASE_URL",
      estado: "error",
      mensaje: "❌ No configurada en .env.local",
    });
  } else {
    resultados.push({
      titulo: "Variable NEXT_PUBLIC_SUPABASE_URL",
      estado: "success",
      mensaje: `✅ Configurada: ${supabaseUrl.substring(0, 30)}...`,
    });
  }

  if (!supabaseAnonKey) {
    resultados.push({
      titulo: "Variable NEXT_PUBLIC_SUPABASE_ANON_KEY",
      estado: "error",
      mensaje: "❌ No configurada en .env.local",
    });
  } else {
    resultados.push({
      titulo: "Variable NEXT_PUBLIC_SUPABASE_ANON_KEY",
      estado: "success",
      mensaje: `✅ Configurada: ${supabaseAnonKey.substring(0, 20)}...`,
    });
  }

  // 2. Intentar crear cliente
  if (supabaseUrl && supabaseAnonKey) {
    try {
      const supabase = await createClient();

      resultados.push({
        titulo: "Cliente de Supabase",
        estado: "success",
        mensaje: "✅ Cliente creado correctamente",
      });

      // 3. Verificar conexión haciendo una consulta simple
      const { data: bienes, error: errorBienes } = await supabase
        .from("bienes")
        .select("id")
        .limit(1);

      if (errorBienes) {
        resultados.push({
          titulo: "Consulta a tabla 'bienes'",
          estado: "error",
          mensaje: `❌ Error: ${errorBienes.message}`,
        });
      } else {
        resultados.push({
          titulo: "Consulta a tabla 'bienes'",
          estado: "success",
          mensaje: `✅ Tabla accesible. ${bienes ? `Encontrados ${bienes.length} registros en la muestra.` : "Tabla vacía pero accesible."}`,
        });
      }

      // 4. Verificar otras tablas
      const tablas = ["imagenes_bienes", "rutas", "rutas_bienes"];

      for (const tabla of tablas) {
        const { error } = await supabase.from(tabla).select("id").limit(1);

        if (error) {
          resultados.push({
            titulo: `Tabla '${tabla}'`,
            estado: "error",
            mensaje: `❌ Error: ${error.message}`,
          });
        } else {
          resultados.push({
            titulo: `Tabla '${tabla}'`,
            estado: "success",
            mensaje: "✅ Tabla accesible",
          });
        }
      }

      // 5. Verificar autenticación
      const {
        data: { user },
        error: errorAuth,
      } = await supabase.auth.getUser();

      if (errorAuth && errorAuth.message !== "Invalid Refresh Token: Refresh Token Not Found") {
        resultados.push({
          titulo: "Sistema de autenticación",
          estado: "warning",
          mensaje: "⚠️ No hay sesión activa (normal si no estás logueado)",
        });
      } else {
        resultados.push({
          titulo: "Sistema de autenticación",
          estado: "success",
          mensaje: user
            ? `✅ Usuario autenticado: ${user.email}`
            : "✅ Sistema funcionando (sin sesión activa)",
        });
      }
    } catch (error) {
      resultados.push({
        titulo: "Error al crear cliente",
        estado: "error",
        mensaje: `❌ ${error instanceof Error ? error.message : "Error desconocido"}`,
      });
    }
  } else {
    resultados.push({
      titulo: "Cliente de Supabase",
      estado: "error",
      mensaje: "❌ No se puede crear el cliente: faltan variables de entorno",
    });
  }

  const todoOk = resultados.every((r) => r.estado === "success");
  const hayErrores = resultados.some((r) => r.estado === "error");

  return (
    <>
      <div className="mb-6">
        {todoOk ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800 font-semibold">
              ✅ Conexión exitosa - Todo está funcionando correctamente
            </p>
          </div>
        ) : hayErrores ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 font-semibold">
              ❌ Hay problemas con la conexión - Revisa los detalles abajo
            </p>
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800 font-semibold">
              ⚠️ Conexión parcial - Revisa los detalles abajo
            </p>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {resultados.map((resultado, index) => (
          <div
            key={index}
            className={`border rounded-lg p-4 ${
              resultado.estado === "success"
                ? "bg-green-50 border-green-200"
                : resultado.estado === "error"
                  ? "bg-red-50 border-red-200"
                  : "bg-yellow-50 border-yellow-200"
            }`}
          >
            <h3 className="font-semibold mb-2">{resultado.titulo}</h3>
            <p className="text-sm">{resultado.mensaje}</p>
          </div>
        ))}
      </div>
    </>
  );
}

function TestSupabaseSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-20 bg-gray-200 rounded-lg" />
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="h-16 bg-gray-100 rounded-lg" />
      ))}
    </div>
  );
}

export default function TestSupabasePage() {
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Prueba de Conexión a Supabase</h1>

      <Suspense fallback={<TestSupabaseSkeleton />}>
        <TestSupabaseContent />
      </Suspense>

      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h2 className="font-semibold mb-2">Instrucciones</h2>
        <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
          <li>
            Verifica que tengas las variables de entorno en{" "}
            <code className="bg-gray-200 px-1 rounded">.env.local</code>
          </li>
          <li>
            Asegúrate de que las tablas existan en tu proyecto de Supabase
          </li>
          <li>
            Si hay errores de permisos, revisa las políticas RLS (Row Level
            Security) en Supabase
          </li>
        </ul>
      </div>
    </div>
  );
}