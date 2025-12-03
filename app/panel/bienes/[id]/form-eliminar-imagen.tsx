import Form from "next/form";
import { eliminarImagen } from "./actions-media";
import { Button } from "@/components/ui/button";

export function FormEliminarImagen({
  imagenId,
  bienId,
}: {
  imagenId: string;
  bienId: string;
}) {
  const eliminarAction = eliminarImagen.bind(null, imagenId, bienId);

  return (
    <Form action={eliminarAction}>
      <Button type="submit" variant="destructive" size="sm">
        Eliminar
      </Button>
    </Form>
  );
}
