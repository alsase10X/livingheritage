import { writeFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Script para generar un placeholder.jpg simple (imagen gris)
 * Ejecutar con: npx tsx scripts/create-placeholder.ts
 */

// JPG mínimo válido: 1x1 pixel gris (#808080) en formato JPEG
// Esto es un JPEG válido de 1 píxel. El navegador lo escalará según el tamaño especificado en CSS.
const grayJpegBase64 = "/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/gA==";

try {
  const imageBuffer = Buffer.from(grayJpegBase64, "base64");
  const outputPath = join(process.cwd(), "public", "images", "placeholder.jpg");
  
  writeFileSync(outputPath, imageBuffer);
  console.log("✅ Placeholder.jpg creado exitosamente en:", outputPath);
  console.log("ℹ️  Imagen: 1x1 píxel gris (se escalará según CSS)");
} catch (error) {
  console.error("❌ Error al crear placeholder:", error);
  process.exit(1);
}
