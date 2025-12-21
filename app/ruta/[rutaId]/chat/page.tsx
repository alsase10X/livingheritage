import { Suspense } from "react";
import { notFound } from "next/navigation";
import { DataStreamProvider } from "@/components/data-stream-provider";
import { RutaChatWrapper } from "@/components/lh/RutaChatWrapper";

// Datos mock para desarrollo
const bienActualMock = {
  id: "1",
  denominacion: "Bóveda de la Catedral de Santa María",
  preguntas_provocadoras: [
    "¿Quién construyó este arco?",
    "¿Qué importancia tuvo en la historia de Cádiz?",
    "¿Por qué se conservó después de la conquista?",
  ],
  generar_bienvenida_auto: true,
  mensaje_bienvenida: null,
};

const guiaMock = {
  nombre: "María",
  avatar: "", // placeholder, se mostrará emoji
  rol: "Tu guía en esta ruta",
};

function ChatSkeleton() {
  return (
    <div className="flex h-dvh w-full">
      <div className="animate-pulse w-full bg-muted" />
    </div>
  );
}

async function CargarChat({
  params,
}: {
  params: Promise<{ rutaId: string }>;
}) {
  const { rutaId } = await params;

  // Por ahora usamos datos mock
  // En el futuro aquí se cargarían los datos reales desde Supabase
  const bienActual = bienActualMock;
  const guia = guiaMock;

  if (!bienActual) {
    return notFound();
  }

  return (
    <RutaChatWrapper rutaId={rutaId} bien={bienActual} guia={guia} />
  );
}

export default function RutaChatPage({
  params,
}: {
  params: Promise<{ rutaId: string }>;
}) {
  return (
    <div className="min-h-dvh w-full bg-gray-900 flex justify-center">
      <div className="w-full max-w-[430px] relative">
        <DataStreamProvider>
          <Suspense fallback={<ChatSkeleton />}>
            <CargarChat params={params} />
          </Suspense>
        </DataStreamProvider>
      </div>
    </div>
  );
}

