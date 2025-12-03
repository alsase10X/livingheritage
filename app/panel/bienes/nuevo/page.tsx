import Link from "next/link";
import Form from "next/form";
import { crearBien } from "../actions";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function NuevoBienPage() {
  return (
    <div className="container mx-auto p-6 max-w-3xl">
      <div className="mb-6">
        <Link
          href="/panel/bienes"
          className="text-blue-600 hover:underline mb-4 inline-block"
        >
          ← Volver a bienes
        </Link>
        <h1 className="text-2xl font-bold">Crear nuevo bien</h1>
        <p className="text-gray-700 mt-1">
          Completa los campos básicos del bien
        </p>
      </div>

      <Form action={crearBien} className="space-y-6">
        <div className="bg-gray-50 border rounded-lg p-6 space-y-6">
          {/* Denominación */}
          <div>
            <label
              htmlFor="denominacion"
              className="text-sm font-medium leading-none text-gray-900"
            >
              Denominación <span className="text-red-500">*</span>
            </label>
            <Input
              id="denominacion"
              name="denominacion"
              required
              placeholder="Ej: Monumento a las Cortes de Cádiz"
              className="mt-1"
            />
          </div>

          {/* Tipo de contenido */}
          <div>
            <label
              htmlFor="tipo_contenido"
              className="text-sm font-medium leading-none text-gray-900"
            >
              Tipo de contenido
            </label>
            <select
              id="tipo_contenido"
              name="tipo_contenido"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 mt-1"
            >
              <option value="">Seleccionar...</option>
              <option value="inmueble">Inmueble</option>
              <option value="mueble">Mueble</option>
              <option value="inmaterial">Inmaterial</option>
            </select>
          </div>

          {/* Tipología */}
          <div>
            <label
              htmlFor="tipologia"
              className="text-sm font-medium leading-none text-gray-900"
            >
              Tipología
            </label>
            <Input
              id="tipologia"
              name="tipologia"
              placeholder="Ej: Monumento conmemorativo"
              className="mt-1"
            />
          </div>

          {/* Periodo */}
          <div>
            <label htmlFor="periodo" className="text-sm font-medium leading-none">
              Periodo
            </label>
            <Input
              id="periodo"
              name="periodo"
              placeholder="Ej: Siglo XX"
              className="mt-1"
            />
          </div>

          {/* Municipio */}
          <div>
            <label htmlFor="municipio" className="text-sm font-medium leading-none">
              Municipio
            </label>
            <Input
              id="municipio"
              name="municipio"
              placeholder="Ej: Cádiz"
              className="mt-1"
            />
          </div>

          {/* Provincia */}
          <div>
            <label htmlFor="provincia" className="text-sm font-medium leading-none">
              Provincia
            </label>
            <Input
              id="provincia"
              name="provincia"
              defaultValue="Cádiz"
              placeholder="Cádiz"
              className="mt-1"
            />
          </div>

          {/* Región */}
          <div>
            <label htmlFor="region" className="text-sm font-medium leading-none">
              Región
            </label>
            <Input
              id="region"
              name="region"
              defaultValue="Andalucía"
              placeholder="Andalucía"
              className="mt-1"
            />
          </div>

          {/* País */}
          <div>
            <label htmlFor="pais" className="text-sm font-medium leading-none">
              País
            </label>
            <Input
              id="pais"
              name="pais"
              defaultValue="España"
              placeholder="España"
              className="mt-1"
            />
          </div>

          {/* Descripción física */}
          <div>
            <label
              htmlFor="descripcion_fisica"
              className="text-sm font-medium leading-none text-gray-900"
            >
              Descripción física
            </label>
            <Textarea
              id="descripcion_fisica"
              name="descripcion_fisica"
              placeholder="Describe las características físicas del bien..."
              rows={4}
              className="mt-1"
            />
          </div>
        </div>

        {/* Botones */}
        <div className="flex gap-4 justify-end">
          <Link href="/panel/bienes">
            <Button type="button" variant="outline">
              Cancelar
            </Button>
          </Link>
          <Button type="submit">Guardar bien</Button>
        </div>
      </Form>
    </div>
  );
}
