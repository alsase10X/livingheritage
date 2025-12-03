"use client";

import { useState } from "react";
import Link from "next/link";
import Form from "next/form";
import type { Database } from "@/types/database";
import { actualizarBienAudioguia } from "./actions-audioguia";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

type Bien = Database["public"]["Tables"]["bienes"]["Row"];

type PuntoDesarrollo = {
  texto: string;
  referencia_visual: string;
};

type GuionAudio = {
  gancho: {
    tipo: string;
    texto: string;
  } | null;
  desarrollo: {
    tema_elegido: string;
    puntos: PuntoDesarrollo[];
  } | null;
  remate: {
    tipo: string;
    texto: string;
  } | null;
};

export function TabAudioguia({ bien }: { bien: Bien }) {
  const actualizarAction = actualizarBienAudioguia.bind(null, bien.id);

  // Inicializar guion desde los datos existentes
  const inicializarGuion = (): GuionAudio => {
    if (bien.guion_audio && typeof bien.guion_audio === "object") {
      const guion = bien.guion_audio as {
        gancho?: { tipo?: string; texto?: string };
        desarrollo?: {
          tema_elegido?: string;
          puntos?: Array<{ texto?: string; referencia_visual?: string }>;
        };
        remate?: { tipo?: string; texto?: string };
      };

      return {
        gancho: guion.gancho
          ? {
              tipo: guion.gancho.tipo || "",
              texto: guion.gancho.texto || "",
            }
          : null,
        desarrollo: guion.desarrollo
          ? {
              tema_elegido: guion.desarrollo.tema_elegido || "",
              puntos:
                guion.desarrollo.puntos && Array.isArray(guion.desarrollo.puntos)
                  ? guion.desarrollo.puntos.map((p) => ({
                      texto: p.texto || "",
                      referencia_visual: p.referencia_visual || "",
                    }))
                  : [],
            }
          : null,
        remate: guion.remate
          ? {
              tipo: guion.remate.tipo || "",
              texto: guion.remate.texto || "",
            }
          : null,
      };
    }

    return {
      gancho: null,
      desarrollo: null,
      remate: null,
    };
  };

  const [guion, setGuion] = useState<GuionAudio>(inicializarGuion);
  const [tieneAudioguia, setTieneAudioguia] = useState<boolean>(
    bien.tiene_audioguia || false
  );

  // Actualizar gancho
  const actualizarGancho = (campo: "tipo" | "texto", valor: string) => {
    setGuion({
      ...guion,
      gancho: {
        ...(guion.gancho || { tipo: "", texto: "" }),
        [campo]: valor,
      },
    });
  };

  // Actualizar desarrollo
  const actualizarDesarrollo = (
    campo: "tema_elegido",
    valor: string
  ) => {
    setGuion({
      ...guion,
      desarrollo: {
        ...(guion.desarrollo || { tema_elegido: "", puntos: [] }),
        [campo]: valor,
      },
    });
  };

  // Añadir punto de desarrollo
  const agregarPuntoDesarrollo = () => {
    setGuion({
      ...guion,
      desarrollo: {
        ...(guion.desarrollo || { tema_elegido: "", puntos: [] }),
        puntos: [
          ...(guion.desarrollo?.puntos || []),
          { texto: "", referencia_visual: "" },
        ],
      },
    });
  };

  // Eliminar punto de desarrollo
  const eliminarPuntoDesarrollo = (index: number) => {
    if (!guion.desarrollo) return;
    setGuion({
      ...guion,
      desarrollo: {
        ...guion.desarrollo,
        puntos: guion.desarrollo.puntos.filter((_, i) => i !== index),
      },
    });
  };

  // Actualizar punto de desarrollo
  const actualizarPuntoDesarrollo = (
    index: number,
    campo: keyof PuntoDesarrollo,
    valor: string
  ) => {
    if (!guion.desarrollo) return;
    const nuevosPuntos = [...guion.desarrollo.puntos];
    nuevosPuntos[index] = { ...nuevosPuntos[index], [campo]: valor };
    setGuion({
      ...guion,
      desarrollo: {
        ...guion.desarrollo,
        puntos: nuevosPuntos,
      },
    });
  };

  // Actualizar remate
  const actualizarRemate = (campo: "tipo" | "texto", valor: string) => {
    setGuion({
      ...guion,
      remate: {
        ...(guion.remate || { tipo: "", texto: "" }),
        [campo]: valor,
      },
    });
  };

  // Calcular duración estimada
  const calcularDuracionEstimada = (duracionObjetivo: number | null) => {
    if (!duracionObjetivo) return null;
    return Math.round(duracionObjetivo * 2.5);
  };

  return (
    <Form action={actualizarAction} className="space-y-6">
      {/* Configuración */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold border-b pb-2 text-gray-900">
          Configuración
        </h2>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="tiene_audioguia"
            name="tiene_audioguia"
            checked={tieneAudioguia}
            onChange={(e) => setTieneAudioguia(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label
            htmlFor="tiene_audioguia"
            className="text-sm font-medium text-gray-900 cursor-pointer"
          >
            Este bien tiene audioguía
          </label>
        </div>

        <div>
          <label
            htmlFor="duracion_objetivo"
            className="text-sm font-medium leading-none block mb-1 text-gray-900"
          >
            Duración objetivo (segundos)
          </label>
          <select
            id="duracion_objetivo"
            name="duracion_objetivo"
            defaultValue={bien.duracion_objetivo?.toString() || ""}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="">Seleccionar...</option>
            <option value="60">60 segundos</option>
            <option value="90">90 segundos</option>
            <option value="120">120 segundos</option>
            <option value="180">180 segundos</option>
          </select>
          {bien.duracion_objetivo && (
            <p className="text-xs text-gray-500 mt-1">
              Duración estimada:{" "}
              {calcularDuracionEstimada(bien.duracion_objetivo)} palabras
              (aproximadamente {bien.duracion_objetivo} segundos)
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="nivel_importancia"
            className="text-sm font-medium leading-none block mb-1 text-gray-900"
          >
            Nivel de importancia
          </label>
          <select
            id="nivel_importancia"
            name="nivel_importancia"
            defaultValue={bien.nivel_importancia || ""}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="">Seleccionar...</option>
            <option value="destacado">Destacado</option>
            <option value="importante">Importante</option>
            <option value="menor">Menor</option>
          </select>
        </div>
      </div>

      {/* Guion */}
      <div className="space-y-4 border-t pt-6">
        <h2 className="text-xl font-semibold text-gray-900">Guion</h2>

        {/* Gancho */}
        <div className="space-y-4 border rounded-lg p-4 bg-white">
          <h3 className="text-lg font-semibold text-gray-900">Gancho</h3>

          <div>
            <label
              htmlFor="gancho_tipo"
              className="text-sm font-medium leading-none block mb-1 text-gray-900"
            >
              Tipo de gancho
            </label>
            <select
              id="gancho_tipo"
              value={guion.gancho?.tipo || ""}
              onChange={(e) => actualizarGancho("tipo", e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="">Seleccionar...</option>
              <option value="pregunta">Pregunta</option>
              <option value="dato">Dato</option>
              <option value="sensorial">Sensorial</option>
              <option value="temporal">Temporal</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="gancho_texto"
              className="text-sm font-medium leading-none block mb-1 text-gray-900"
            >
              Texto del gancho
            </label>
            <Textarea
              id="gancho_texto"
              value={guion.gancho?.texto || ""}
              onChange={(e) => actualizarGancho("texto", e.target.value)}
              placeholder="Primera frase que capta la atención del visitante..."
              rows={3}
              className="mt-1"
            />
          </div>
        </div>

        {/* Desarrollo */}
        <div className="space-y-4 border rounded-lg p-4 bg-white">
          <h3 className="text-lg font-semibold text-gray-900">Desarrollo</h3>

          <div>
            <label
              htmlFor="desarrollo_tema"
              className="text-sm font-medium leading-none block mb-1 text-gray-900"
            >
              Tema elegido
            </label>
            <Input
              id="desarrollo_tema"
              value={guion.desarrollo?.tema_elegido || ""}
              onChange={(e) =>
                actualizarDesarrollo("tema_elegido", e.target.value)
              }
              placeholder="Tema central del desarrollo..."
              className="mt-1"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-gray-900">
                Puntos del desarrollo
              </label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={agregarPuntoDesarrollo}
              >
                Añadir punto
              </Button>
            </div>

            {guion.desarrollo?.puntos && guion.desarrollo.puntos.length > 0 ? (
              <div className="space-y-3">
                {guion.desarrollo.puntos.map((punto, index) => (
                  <div
                    key={index}
                    className="border rounded-lg p-3 space-y-2 bg-gray-50"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        Punto {index + 1}
                      </span>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => eliminarPuntoDesarrollo(index)}
                      >
                        Eliminar
                      </Button>
                    </div>

                    <div>
                      <label
                        htmlFor={`punto_texto_${index}`}
                        className="text-sm font-medium leading-none block mb-1 text-gray-900"
                      >
                        Texto
                      </label>
                      <Textarea
                        id={`punto_texto_${index}`}
                        value={punto.texto}
                        onChange={(e) =>
                          actualizarPuntoDesarrollo(
                            index,
                            "texto",
                            e.target.value
                          )
                        }
                        placeholder="Contenido del punto..."
                        rows={3}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor={`punto_referencia_${index}`}
                        className="text-sm font-medium leading-none block mb-1 text-gray-900"
                      >
                        Referencia visual (opcional)
                      </label>
                      <Input
                        id={`punto_referencia_${index}`}
                        value={punto.referencia_visual}
                        onChange={(e) =>
                          actualizarPuntoDesarrollo(
                            index,
                            "referencia_visual",
                            e.target.value
                          )
                        }
                        placeholder="Ej: Mira el friso superior, la columna de la izquierda..."
                        className="mt-1"
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                No hay puntos añadidos. Haz clic en "Añadir punto" para
                empezar.
              </p>
            )}
          </div>
        </div>

        {/* Remate */}
        <div className="space-y-4 border rounded-lg p-4 bg-white">
          <h3 className="text-lg font-semibold text-gray-900">Remate</h3>

          <div>
            <label
              htmlFor="remate_tipo"
              className="text-sm font-medium leading-none block mb-1 text-gray-900"
            >
              Tipo de remate
            </label>
            <select
              id="remate_tipo"
              value={guion.remate?.tipo || ""}
              onChange={(e) => actualizarRemate("tipo", e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="">Seleccionar...</option>
              <option value="reflexion">Reflexión</option>
              <option value="conexion">Conexión</option>
              <option value="invitacion">Invitación</option>
              <option value="dato">Dato</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="remate_texto"
              className="text-sm font-medium leading-none block mb-1 text-gray-900"
            >
              Texto del remate
            </label>
            <Textarea
              id="remate_texto"
              value={guion.remate?.texto || ""}
              onChange={(e) => actualizarRemate("texto", e.target.value)}
              placeholder="Frase final que cierra la audioguía..."
              rows={3}
              className="mt-1"
            />
          </div>
        </div>

        {/* Campo oculto para enviar el guion como JSON */}
        <input
          type="hidden"
          name="guion_audio"
          value={JSON.stringify(guion)}
        />
      </div>

      {/* Notas de locución */}
      <div className="space-y-4 border-t pt-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Notas de locución
        </h2>

        <div>
          <label
            htmlFor="tono_audioguia"
            className="text-sm font-medium leading-none block mb-1 text-gray-900"
          >
            Tono de la audioguía
          </label>
          <select
            id="tono_audioguia"
            name="tono_audioguia"
            defaultValue={bien.tono_audioguia || ""}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="">Seleccionar...</option>
            <option value="formal">Formal</option>
            <option value="cercano">Cercano</option>
            <option value="solemne">Solemne</option>
            <option value="dinámico">Dinámico</option>
          </select>
        </div>
      </div>

      {/* Control editorial */}
      <div className="space-y-4 border-t pt-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Control editorial
        </h2>

        <div>
          <label
            htmlFor="estado_audioguia"
            className="text-sm font-medium leading-none block mb-1 text-gray-900"
          >
            Estado de la audioguía
          </label>
          <select
            id="estado_audioguia"
            name="estado_audioguia"
            defaultValue={bien.estado_audioguia || ""}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="">Seleccionar...</option>
            <option value="borrador">Borrador</option>
            <option value="revisada">Revisada</option>
            <option value="publicada">Publicada</option>
          </select>
        </div>
      </div>

      {/* Campo oculto para tiene_audioguia */}
      <input
        type="hidden"
        name="tiene_audioguia"
        value={tieneAudioguia.toString()}
      />

      {/* Botones */}
      <div className="flex gap-4 justify-end border-t pt-6">
        <Link href="/panel/bienes">
          <Button type="button" variant="outline">
            Cancelar
          </Button>
        </Link>
        <Button type="submit">Guardar Audioguía</Button>
      </div>
    </Form>
  );
}
