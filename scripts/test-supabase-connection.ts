import { config } from "dotenv";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../types/database.js";

// Cargar variables de entorno desde .env.local
config({ path: resolve(process.cwd(), ".env.local") });

async function testSupabaseConnection() {
  console.log("🔍 Verificando conexión a Supabase...\n");

  // 1. Verificar variables de entorno
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl) {
    console.error("❌ ERROR: NEXT_PUBLIC_SUPABASE_URL no está configurada");
    console.log("   Por favor, agrega NEXT_PUBLIC_SUPABASE_URL en .env.local");
    process.exit(1);
  }

  if (!supabaseAnonKey) {
    console.error("❌ ERROR: NEXT_PUBLIC_SUPABASE_ANON_KEY no está configurada");
    console.log("   Por favor, agrega NEXT_PUBLIC_SUPABASE_ANON_KEY en .env.local");
    process.exit(1);
  }

  console.log("✅ Variables de entorno configuradas");
  console.log(`   URL: ${supabaseUrl.substring(0, 30)}...`);
  console.log(`   Key: ${supabaseAnonKey.substring(0, 20)}...\n`);

  // 2. Crear cliente
  let supabase;
  try {
    supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
    console.log("✅ Cliente de Supabase creado correctamente\n");
  } catch (error) {
    console.error("❌ ERROR al crear cliente de Supabase:");
    console.error(`   ${error instanceof Error ? error.message : "Error desconocido"}`);
    process.exit(1);
  }

  // 3. Verificar tablas
  const tablas = ["bienes", "imagenes_bienes", "rutas", "rutas_bienes"];
  let errores = 0;

  for (const tabla of tablas) {
    try {
      const { data, error } = await supabase
        .from(tabla)
        .select("id")
        .limit(1);

      if (error) {
        console.error(`❌ Tabla '${tabla}': ERROR`);
        console.error(`   ${error.message}`);
        errores++;
      } else {
        const count = data?.length ?? 0;
        console.log(
          `✅ Tabla '${tabla}': Accesible ${count > 0 ? `(${count} registro en muestra)` : "(vacía o sin registros)"}`
        );
      }
    } catch (error) {
      console.error(`❌ Tabla '${tabla}': EXCEPCIÓN`);
      console.error(`   ${error instanceof Error ? error.message : "Error desconocido"}`);
      errores++;
    }
  }

  console.log();

  // 4. Verificar autenticación (opcional, no crítico)
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      console.log(`✅ Autenticación: Usuario conectado (${user.email})`);
    } else {
      console.log("✅ Autenticación: Sistema funcionando (sin sesión activa)");
    }
  } catch (error) {
    console.log("⚠️  Autenticación: No se pudo verificar (no crítico)");
  }

  console.log();

  // Resumen final
  if (errores === 0) {
    console.log("🎉 ¡Conexión exitosa! Todas las verificaciones pasaron.");
    process.exit(0);
  } else {
    console.error(`❌ Se encontraron ${errores} error(es). Revisa los detalles arriba.`);
    process.exit(1);
  }
}

// Ejecutar
testSupabaseConnection().catch((error) => {
  console.error("❌ Error fatal:", error);
  process.exit(1);
});
