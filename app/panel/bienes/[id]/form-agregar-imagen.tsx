import Form from "next/form";
import { agregarImagen } from "./actions-media";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function FormAgregarImagen({ bienId }: { bienId: string }) {
  const agregarAction = agregarImagen.bind(null, bienId);

  return (
    <Form action={agregarAction} className="space-y-4">
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

      <Button type="submit">Añadir imagen</Button>
    </Form>
  );
}
