"use client";

import { useState } from "react";
import Form from "next/form";
import { agregarImagen } from "./actions-media";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function FormAgregarImagen({ bienId }: { bienId: string }) {
  const agregarAction = agregarImagen.bind(null, bienId);
  const [uploadMethod, setUploadMethod] = useState<"file" | "url">("file");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string>("");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("filename", file.name);

      const response = await fetch(`/api/bien/${bienId}/imagen/upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error al subir la imagen");
      }

      const data = await response.json();
      setUploadedUrl(data.url);
    } catch (error) {
      console.error("Error al subir imagen:", error);
      alert(error instanceof Error ? error.message : "Error al subir la imagen");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Form action={agregarAction} className="space-y-4">
      {/* Selector de método */}
      <div className="flex gap-4 border-b pb-4">
        <button
          type="button"
          onClick={() => {
            setUploadMethod("file");
            setUploadedUrl("");
          }}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            uploadMethod === "file"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Subir archivo
        </button>
        <button
          type="button"
          onClick={() => {
            setUploadMethod("url");
            setUploadedUrl("");
          }}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            uploadMethod === "url"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Usar URL
        </button>
      </div>

      {/* Campo de subida de archivo */}
      {uploadMethod === "file" && (
        <div>
          <label
            htmlFor="file"
            className="text-sm font-medium leading-none block mb-1 text-gray-900"
          >
            Archivo de imagen <span className="text-red-500">*</span>
          </label>
          <Input
            id="file"
            name="file"
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
            onChange={handleFileChange}
            disabled={isUploading}
            className="mt-1"
          />
          {isUploading && (
            <p className="text-sm text-gray-500 mt-1">Subiendo imagen...</p>
          )}
          {uploadedUrl && (
            <p className="text-sm text-green-600 mt-1">
              ✓ Imagen subida correctamente
            </p>
          )}
          {/* Campo oculto con la URL subida */}
          <input type="hidden" name="url" value={uploadedUrl} />
        </div>
      )}

      {/* Campo de URL */}
      {uploadMethod === "url" && (
        <div>
          <label
            htmlFor="url"
            className="text-sm font-medium leading-none block mb-1 text-gray-900"
          >
            URL <span className="text-red-500">*</span>
          </label>
          <Input
            id="url"
            name="url"
            type="url"
            required
            placeholder="https://ejemplo.com/imagen.jpg"
            className="mt-1"
          />
        </div>
      )}

      <div>
        <label
          htmlFor="titulo"
          className="text-sm font-medium leading-none block mb-1 text-gray-900"
        >
          Título
        </label>
        <Input
          id="titulo"
          name="titulo"
          placeholder="Título de la imagen"
          className="mt-1"
        />
      </div>

      <div>
        <label
          htmlFor="autor"
          className="text-sm font-medium leading-none block mb-1 text-gray-900"
        >
          Autor
        </label>
        <Input
          id="autor"
          name="autor"
          placeholder="Nombre del autor"
          className="mt-1"
        />
      </div>

      <Button type="submit" disabled={uploadMethod === "file" && !uploadedUrl}>
        {isUploading ? "Subiendo..." : "Añadir imagen"}
      </Button>
    </Form>
  );
}
