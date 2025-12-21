"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
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
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Solo procesar si se está marcando (no desmarcando)
    if (e.target.checked && !esPrincipal) {
      startTransition(async () => {
        try {
          await marcarImagenPrincipal(imagenId, bienId);
          // Refrescar la página para mostrar el cambio
          router.refresh();
        } catch (error) {
          console.error("Error al marcar imagen como principal:", error);
          // Revertir el estado del checkbox si hay error
          e.target.checked = false;
        }
      });
    }
  };

  return (
    <input
      type="checkbox"
      id={`principal-${imagenId}`}
      checked={esPrincipal}
      onChange={handleChange}
      disabled={isPending}
      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
    />
  );
}
