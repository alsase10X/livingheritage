"use client";

import { useState } from "react";
import Link from "next/link";
import Form from "next/form";
import type { Database } from "@/types/database";
import { actualizarBienCapa1 } from "./actions";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FormAgregarImagen } from "./form-agregar-imagen";
import { FormEliminarImagen } from "./form-eliminar-imagen";
import { CheckboxPrincipal } from "./checkbox-principal";
import { TabInterpretacion } from "./tab-interpretacion";
import { TabAudioguia } from "./tab-audioguia";

type Bien = Database["public"]["Tables"]["bienes"]["Row"];
type Imagen = Database["public"]["Tables"]["imagenes_bienes"]["Row"];

type TabType = "basicos" | "interpretacion" | "audioguia" | "media" | "preview";

interface EditorBienProps {
  bien: Bien;
  imagenes: Imagen[];
}

export function EditorBien({ bien, imagenes }: EditorBienProps) {
  const [activeTab, setActiveTab] = useState<TabType>("basicos");

  const tabs: Array<{ id: TabType; label: string }> = [
    { id: "basicos", label: "Datos básicos (Capa 1)" },
    { id: "interpretacion", label: "Interpretación (Capa 2)" },
    { id: "audioguia", label: "Audioguía" },
    { id: "media", label: "Media" },
    { id: "preview", label: "Preview" },
  ];

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/panel/bienes"
          className="text-blue-600 hover:underline mb-4 inline-block"
        >
          ← Volver a bienes
        </Link>
        <h1 className="text-2xl font-bold">Editor de bien</h1>
        <p className="text-gray-700 mt-1">{bien.denominacion}</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
              activeTab === tab.id
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-gray-50 border rounded-lg p-6">
        {activeTab === "basicos" && <TabBasicos bien={bien} />}
        {activeTab === "interpretacion" && <TabInterpretacion bien={bien} />}
        {activeTab === "audioguia" && <TabAudioguia bien={bien} />}
        {activeTab === "media" && <TabMedia bien={bien} imagenes={imagenes} />}
        {activeTab === "preview" && (
          <TabPreview bien={bien} imagenes={imagenes} />
        )}
      </div>
    </div>
  );
}

function TabBasicos({ bien }: { bien: Bien }) {
  const actualizarAction = actualizarBienCapa1.bind(null, bien.id);

  return (
    <Form action={actualizarAction} className="space-y-6">
      {/* Identificación */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold border-b pb-2 text-gray-900">
          Identificación
        </h2>

        <div>
          <label
            htmlFor="denominacion"
            className="text-sm font-medium leading-none block mb-1 text-gray-900"
          >
            Denominación <span className="text-red-500">*</span>
          </label>
          <Input
            id="denominacion"
            name="denominacion"
            required
            defaultValue={bien.denominacion}
            className="mt-1"
          />
        </div>

        <div>
          <label
            htmlFor="tipo_contenido"
            className="text-sm font-medium leading-none block mb-1 text-gray-900"
          >
            Tipo de contenido
          </label>
          <select
            id="tipo_contenido"
            name="tipo_contenido"
            defaultValue={bien.tipo_contenido || ""}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="">Seleccionar...</option>
            <option value="inmueble">Inmueble</option>
            <option value="mueble">Mueble</option>
            <option value="inmaterial">Inmaterial</option>
            <option value="ruta">Ruta</option>
            <option value="paisaje">Paisaje</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="caracterizacion"
            className="text-sm font-medium leading-none block mb-1 text-gray-900"
          >
            Caracterización
          </label>
          <Input
            id="caracterizacion"
            name="caracterizacion"
            defaultValue={bien.caracterizacion || ""}
            className="mt-1"
          />
        </div>

        <div>
          <label
            htmlFor="tipologia"
            className="text-sm font-medium leading-none block mb-1 text-gray-900"
          >
            Tipología (separadas por comas)
          </label>
          <Input
            id="tipologia"
            name="tipologia"
            defaultValue={bien.tipologia?.join(", ") || ""}
            placeholder="Ej: Monumento, Conmemorativo"
            className="mt-1"
          />
        </div>

        <div>
          <label
            htmlFor="periodos"
            className="text-sm font-medium leading-none block mb-1 text-gray-900"
          >
            Periodos (separados por comas)
          </label>
          <Input
            id="periodos"
            name="periodos"
            defaultValue={bien.periodos?.join(", ") || ""}
            placeholder="Ej: Siglo XX, 1900-2000"
            className="mt-1"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="cronologia_inicio"
              className="text-sm font-medium leading-none block mb-1 text-gray-900"
            >
              Cronología inicio
            </label>
            <Input
              id="cronologia_inicio"
              name="cronologia_inicio"
              type="number"
              defaultValue={bien.cronologia_inicio || ""}
              className="mt-1"
            />
          </div>
          <div>
            <label
              htmlFor="cronologia_fin"
              className="text-sm font-medium leading-none block mb-1 text-gray-900"
            >
              Cronología fin
            </label>
            <Input
              id="cronologia_fin"
              name="cronologia_fin"
              type="number"
              defaultValue={bien.cronologia_fin || ""}
              className="mt-1"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="estilos"
            className="text-sm font-medium leading-none block mb-1 text-gray-900"
          >
            Estilos (separados por comas)
          </label>
          <Input
            id="estilos"
            name="estilos"
            defaultValue={bien.estilos?.join(", ") || ""}
            className="mt-1"
          />
        </div>

        <div>
          <label
            htmlFor="proteccion"
            className="text-sm font-medium leading-none block mb-1 text-gray-900"
          >
            Protección
          </label>
          <Input
            id="proteccion"
            name="proteccion"
            defaultValue={bien.proteccion || ""}
            className="mt-1"
          />
        </div>
      </div>

      {/* Localización */}
      <div className="space-y-4 border-t pt-6">
        <h2 className="text-xl font-semibold border-b pb-2 text-gray-900">
          Localización
        </h2>

        <div>
          <label
            htmlFor="direccion"
            className="text-sm font-medium leading-none block mb-1 text-gray-900"
          >
            Dirección
          </label>
          <Input
            id="direccion"
            name="direccion"
            defaultValue={bien.direccion || ""}
            className="mt-1"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="municipio"
              className="text-sm font-medium leading-none block mb-1 text-gray-900"
            >
              Municipio
            </label>
            <Input
              id="municipio"
              name="municipio"
              defaultValue={bien.municipio || ""}
              className="mt-1"
            />
          </div>
          <div>
            <label
              htmlFor="provincia"
              className="text-sm font-medium leading-none block mb-1 text-gray-900"
            >
              Provincia
            </label>
            <Input
              id="provincia"
              name="provincia"
              defaultValue={bien.provincia || ""}
              className="mt-1"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="region"
              className="text-sm font-medium leading-none block mb-1 text-gray-900"
            >
              Región
            </label>
            <Input
              id="region"
              name="region"
              defaultValue={bien.region || ""}
              className="mt-1"
            />
          </div>
          <div>
            <label
              htmlFor="pais"
              className="text-sm font-medium leading-none block mb-1 text-gray-900"
            >
              País
            </label>
            <Input
              id="pais"
              name="pais"
              defaultValue={bien.pais || ""}
              className="mt-1"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="lat"
              className="text-sm font-medium leading-none block mb-1 text-gray-900"
            >
              Latitud
            </label>
            <Input
              id="lat"
              name="lat"
              type="number"
              step="any"
              defaultValue={bien.lat || ""}
              className="mt-1"
            />
          </div>
          <div>
            <label
              htmlFor="lon"
              className="text-sm font-medium leading-none block mb-1 text-gray-900"
            >
              Longitud
            </label>
            <Input
              id="lon"
              name="lon"
              type="number"
              step="any"
              defaultValue={bien.lon || ""}
              className="mt-1"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="direccion_humana"
            className="text-sm font-medium leading-none block mb-1 text-gray-900"
          >
            Dirección humana
          </label>
          <Input
            id="direccion_humana"
            name="direccion_humana"
            defaultValue={bien.direccion_humana || ""}
            placeholder="Ej: Plaza de España, frente al monumento"
            className="mt-1"
          />
        </div>

        <div>
          <label
            htmlFor="indicaciones_llegada"
            className="text-sm font-medium leading-none block mb-1 text-gray-900"
          >
            Indicaciones de llegada
          </label>
          <Textarea
            id="indicaciones_llegada"
            name="indicaciones_llegada"
            defaultValue={bien.indicaciones_llegada || ""}
            placeholder="Ej: Desde Puerta de Tierra, 5 min..."
            rows={3}
            className="mt-1"
          />
        </div>
      </div>

      {/* Textos */}
      <div className="space-y-4 border-t pt-6">
        <h2 className="text-xl font-semibold border-b pb-2 text-gray-900">
          Textos
        </h2>

        <div>
          <label
            htmlFor="descripcion_fisica"
            className="text-sm font-medium leading-none block mb-1 text-gray-900"
          >
            Descripción física
          </label>
          <Textarea
            id="descripcion_fisica"
            name="descripcion_fisica"
            defaultValue={bien.descripcion_fisica || ""}
            rows={6}
            className="mt-1"
          />
        </div>

        <div>
          <label
            htmlFor="descripcion_artistica"
            className="text-sm font-medium leading-none block mb-1 text-gray-900"
          >
            Descripción artística
          </label>
          <Textarea
            id="descripcion_artistica"
            name="descripcion_artistica"
            defaultValue={bien.descripcion_artistica || ""}
            rows={6}
            className="mt-1"
          />
        </div>

        <div>
          <label
            htmlFor="datos_historicos"
            className="text-sm font-medium leading-none block mb-1 text-gray-900"
          >
            Datos históricos
          </label>
          <Textarea
            id="datos_historicos"
            name="datos_historicos"
            defaultValue={bien.datos_historicos || ""}
            rows={6}
            className="mt-1"
          />
        </div>
      </div>

      {/* Sistema */}
      <div className="space-y-4 border-t pt-6">
        <h2 className="text-xl font-semibold border-b pb-2 text-gray-900">
          Sistema
        </h2>

        <div>
          <label
            htmlFor="completitud_ficha"
            className="text-sm font-medium leading-none block mb-1 text-gray-900"
          >
            Completitud de ficha
          </label>
          <select
            id="completitud_ficha"
            name="completitud_ficha"
            defaultValue={bien.completitud_ficha || ""}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="">Seleccionar...</option>
            <option value="rica">Rica</option>
            <option value="media">Media</option>
            <option value="pobre">Pobre</option>
          </select>
        </div>
      </div>

      {/* Botones */}
      <div className="flex gap-4 justify-end border-t pt-6">
        <Link href="/panel/bienes">
          <Button type="button" variant="outline">
            Cancelar
          </Button>
        </Link>
        <Button type="submit">Guardar Capa 1</Button>
      </div>
    </Form>
  );
}



function TabMedia({
  bien,
  imagenes,
}: {
  bien: Bien;
  imagenes: Imagen[];
}) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold border-b pb-2 text-gray-900">
        Imágenes del bien
      </h2>

      {/* Lista de imágenes */}
      {imagenes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {imagenes.map((imagen) => (
            <ImagenCard
              key={imagen.id}
              imagen={imagen}
              bienId={bien.id}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          No hay imágenes agregadas aún.
        </div>
      )}

      {/* Formulario para añadir imagen */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">
          Añadir nueva imagen
        </h3>
        <FormAgregarImagen bienId={bien.id} />
      </div>
    </div>
  );
}

function ImagenCard({
  imagen,
  bienId,
}: {
  imagen: Imagen;
  bienId: string;
}) {
  return (
    <div className="border rounded-lg p-4 space-y-3">
      {/* Miniatura */}
      {imagen.url ? (
        <div className="relative w-full aspect-video bg-gray-100 rounded overflow-hidden">
          {/* biome-ignore lint/a11y/noSvgWithoutTitle: Miniatura de imagen */}
          <img
            src={imagen.url}
            alt={imagen.titulo || "Imagen"}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = "none";
            }}
          />
        </div>
      ) : (
        <div className="w-full aspect-video bg-gray-200 rounded flex items-center justify-center text-gray-400 text-sm">
          Sin imagen
        </div>
      )}

      {/* Título */}
      <div>
        <p className="font-medium text-sm">{imagen.titulo || "Sin título"}</p>
        {imagen.autor && (
          <p className="text-xs text-gray-500">Por: {imagen.autor}</p>
        )}
      </div>

      {/* Checkbox Es principal */}
      <div className="flex items-center gap-2">
        <CheckboxPrincipal
          imagenId={imagen.id}
          bienId={bienId}
          esPrincipal={imagen.es_principal || false}
        />
        <label
          htmlFor={`principal-${imagen.id}`}
          className="text-sm text-gray-700 cursor-pointer"
        >
          Es principal
        </label>
      </div>

      {/* Botón eliminar */}
      <FormEliminarImagen imagenId={imagen.id} bienId={bienId} />
    </div>
  );
}


function TabPreview({
  bien,
  imagenes,
}: {
  bien: Bien;
  imagenes: Imagen[];
}) {
  // Obtener imagen principal
  const imagenPrincipal = imagenes.find((img) => img.es_principal) || imagenes[0];

  // Verificar estados
  const tieneImagenPrincipal = Boolean(imagenPrincipal?.url);
  const tieneDescripcion = Boolean(
    bien.descripcion_fisica || bien.descripcion_artistica
  );
  const tieneCapa2 = Boolean(bien.tiene_capa_2);
  const tieneAudioguia = Boolean(bien.tiene_audioguia);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold border-b pb-2 text-gray-900">
        Vista previa del bien
      </h2>

      {/* Indicadores de estado */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">
          Estado del contenido
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="flex items-center gap-2">
            {tieneImagenPrincipal ? (
              <span className="text-green-600">✅</span>
            ) : (
              <span className="text-red-600">❌</span>
            )}
            <span className="text-sm text-gray-700">Imagen principal</span>
          </div>
          <div className="flex items-center gap-2">
            {tieneDescripcion ? (
              <span className="text-green-600">✅</span>
            ) : (
              <span className="text-red-600">❌</span>
            )}
            <span className="text-sm text-gray-700">Descripción</span>
          </div>
          <div className="flex items-center gap-2">
            {tieneCapa2 ? (
              <span className="text-green-600">✅</span>
            ) : (
              <span className="text-red-600">❌</span>
            )}
            <span className="text-sm text-gray-700">Capa 2</span>
          </div>
          <div className="flex items-center gap-2">
            {tieneAudioguia ? (
              <span className="text-green-600">✅</span>
            ) : (
              <span className="text-red-600">❌</span>
            )}
            <span className="text-sm text-gray-700">Audioguía</span>
          </div>
        </div>
      </div>

      {/* Vista previa del bien */}
      <div className="border rounded-lg overflow-hidden bg-white">
        {/* Imagen principal */}
        {imagenPrincipal?.url ? (
          <div className="relative w-full h-64 md:h-96 bg-gray-200">
            {/* biome-ignore lint/a11y/noSvgWithoutTitle: Imagen de preview */}
            <img
              src={imagenPrincipal.url}
              alt={bien.denominacion}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
              }}
            />
          </div>
        ) : (
          <div className="w-full h-64 md:h-96 bg-gray-200 flex items-center justify-center text-gray-400">
            Sin imagen principal
          </div>
        )}

        {/* Contenido */}
        <div className="p-6 space-y-4">
          {/* Denominación */}
          <h1 className="text-3xl font-bold text-gray-900">
            {bien.denominacion}
          </h1>

          {/* Ubicación */}
          {(bien.municipio || bien.provincia) && (
            <div className="flex items-center gap-2 text-gray-700">
              {bien.municipio && <span>{bien.municipio}</span>}
              {bien.municipio && bien.provincia && <span>•</span>}
              {bien.provincia && <span>{bien.provincia}</span>}
            </div>
          )}

          {/* Tipología y periodo */}
          <div className="flex flex-wrap gap-2">
            {bien.tipologia && bien.tipologia.length > 0 && (
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                {bien.tipologia.join(", ")}
              </span>
            )}
            {bien.periodos && bien.periodos.length > 0 && (
              <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                {bien.periodos.join(", ")}
              </span>
            )}
          </div>

          {/* Descripción física */}
          {bien.descripcion_fisica && (
            <div className="mt-4">
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {bien.descripcion_fisica}
              </p>
            </div>
          )}

          {/* Mensaje de bienvenida */}
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <p className="text-gray-900 font-medium">
              Bienvenido. Soy {bien.denominacion}. ¿Qué te gustaría saber de
              mí?
            </p>
          </div>

          {/* Chips de preguntas sugeridas */}
          {bien.preguntas_provocadoras &&
            bien.preguntas_provocadoras.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  Preguntas sugeridas:
                </h3>
                <div className="flex flex-wrap gap-2">
                  {bien.preguntas_provocadoras.map((pregunta, index) => (
                    <button
                      key={index}
                      type="button"
                      className="px-4 py-2 bg-white border border-gray-300 rounded-full text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      {pregunta}
                    </button>
                  ))}
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
