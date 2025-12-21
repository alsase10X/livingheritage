import { Suspense } from "react";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BienChatWrapper } from "@/components/lh/BienChatWrapper";
import type { Database } from "@/types/database";

type Bien = Database["public"]["Tables"]["bienes"]["Row"];
type Imagen = Database["public"]["Tables"]["imagenes_bienes"]["Row"];

async function CargarBien({ id }: { id: string }) {
  const supabase = await createClient();

  const { data: bien, error } = await supabase
    .from("bienes")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !bien) {
    return notFound();
  }

  // Cargar imagen principal (primero buscar la marcada como principal, luego la primera disponible)
  let imagenPrincipal: Imagen | null = null;
  
  // Buscar imagen marcada como principal
  const { data: imagenPrincipalData } = await supabase
    .from("imagenes_bienes")
    .select("*")
    .eq("bien_id", id)
    .eq("es_principal", true)
    .maybeSingle();
  
  if (imagenPrincipalData) {
    imagenPrincipal = imagenPrincipalData;
  } else {
    // Si no hay imagen principal, usar la primera imagen disponible
    const { data: primeraImagen } = await supabase
      .from("imagenes_bienes")
      .select("*")
      .eq("bien_id", id)
      .order("orden", { ascending: true })
      .limit(1)
      .maybeSingle();
    
    if (primeraImagen) {
      imagenPrincipal = primeraImagen;
    }
  }

  return (
    <BienChatWrapper
      bien={bien}
      imagenPrincipal={imagenPrincipal || null}
    />
  );
}

function BienSkeleton() {
  return (
    <div className="flex h-dvh">
      <div className="animate-pulse w-full" />
    </div>
  );
}

export default async function BienPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <Suspense fallback={<BienSkeleton />}>
      <CargarBien id={id} />
    </Suspense>
  );
}