import Form from "next/form";
import { marcarImagenPrincipal } from "./actions-media";

export function CheckboxPrincipal({
  imagenId,
  bienId,
  esPrincipal,
}: {
  imagenId: string;
  bienId: string;
  esPrincipal: boolean;
}) {
  const marcarPrincipalAction = marcarImagenPrincipal.bind(
    null,
    imagenId,
    bienId
  );

  if (esPrincipal) {
    return (
      <input
        type="checkbox"
        id={`principal-${imagenId}`}
        checked
        readOnly
        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
      />
    );
  }

  return (
    <Form action={marcarPrincipalAction}>
      <button type="submit" className="cursor-pointer">
        <input
          type="checkbox"
          id={`principal-${imagenId}`}
          readOnly
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
      </button>
    </Form>
  );
}
