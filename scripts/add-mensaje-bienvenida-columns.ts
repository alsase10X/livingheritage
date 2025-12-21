import { config } from "dotenv";
import postgres from "postgres";

config({
  path: ".env.local",
});

const runMigration = async () => {
  // Intentar usar POSTGRES_URL primero (conexión directa)
  const postgresUrl = process.env.POSTGRES_URL;
  
  if (!postgresUrl) {
    console.error("❌ POSTGRES_URL no está configurada en .env.local");
    console.log("\n");
    console.log("⚠️  No puedo ejecutar la migración automáticamente.");
    console.log("Por favor, ejecuta esta migración SQL manualmente en el SQL Editor de Supabase:");
    console.log("\n");
    console.log("ALTER TABLE bienes");
    console.log("ADD COLUMN IF NOT EXISTS generar_bienvenida_auto BOOLEAN DEFAULT true,");
    console.log("ADD COLUMN IF NOT EXISTS mensaje_bienvenida TEXT;");
    console.log("\n");
    console.log("O configura POSTGRES_URL en .env.local con la URL de conexión directa de Supabase.");
    process.exit(1);
  }

  console.log("⏳ Conectando a la base de datos...");
  
  const sql = postgres(postgresUrl, { max: 1 });

  try {
    console.log("⏳ Añadiendo columnas de mensaje de bienvenida...");
    
    await sql`
      ALTER TABLE bienes 
      ADD COLUMN IF NOT EXISTS generar_bienvenida_auto BOOLEAN DEFAULT true,
      ADD COLUMN IF NOT EXISTS mensaje_bienvenida TEXT;
    `;

    console.log("✅ Columnas añadidas correctamente");
  } catch (err) {
    console.error("❌ Error al ejecutar la migración:");
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  } finally {
    await sql.end();
  }

  process.exit(0);
};

runMigration().catch((err) => {
  console.error("❌ Error inesperado:");
  console.error(err);
  process.exit(1);
});

