import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

config({
  path: ".env.local",
});

const createBucket = async () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("❌ NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY deben estar definidos en .env.local");
    process.exit(1);
  }

  // Usar service role key para tener permisos de administrador
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const bucketName = "imagenes-bienes";

  console.log(`⏳ Verificando bucket '${bucketName}'...`);

  // Verificar si el bucket existe
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();

  if (listError) {
    console.error("❌ Error al listar buckets:", listError.message);
    process.exit(1);
  }

  const bucketExists = buckets?.some((bucket) => bucket.name === bucketName);

  if (bucketExists) {
    console.log(`✅ El bucket '${bucketName}' ya existe`);
    process.exit(0);
  }

  // Crear el bucket
  console.log(`⏳ Creando bucket '${bucketName}'...`);

  const { data, error } = await supabase.storage.createBucket(bucketName, {
    public: true,
    fileSizeLimit: 10485760, // 10MB
    allowedMimeTypes: [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
    ],
  });

  if (error) {
    console.error("❌ Error al crear el bucket:", error.message);
    console.log("\n");
    console.log("⚠️  Puedes crear el bucket manualmente en Supabase:");
    console.log("1. Ve a Storage en el dashboard de Supabase");
    console.log(`2. Crea un nuevo bucket llamado '${bucketName}'`);
    console.log("3. Configúralo como público");
    console.log("4. Establece límite de tamaño: 10MB");
    process.exit(1);
  }

  console.log(`✅ Bucket '${bucketName}' creado correctamente`);
  process.exit(0);
};

createBucket().catch((err) => {
  console.error("❌ Error inesperado:", err);
  process.exit(1);
});

