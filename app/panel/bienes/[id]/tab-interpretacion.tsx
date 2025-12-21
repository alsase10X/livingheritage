"use client";

import { useState } from "react";
import Link from "next/link";
import Form from "next/form";
import type { Database } from "@/types/database";
import { actualizarBienCapa2 } from "./actions-capa2";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

type Bien = Database["public"]["Tables"]["bienes"]["Row"];

type MensajeClave = {
  mensaje: string;
  desarrollo: string;
  fuente: string;
};

type Anecdota = {
  titulo: string;
  contenido: string;
  verificada: boolean;
};

export function TabInterpretacion({ bien }: { bien: Bien }) {
  const actualizarAction = actualizarBienCapa2.bind(null, bien.id);

  // Inicializar mensajes clave desde los datos existentes
  const inicializarMensajesClave = (): MensajeClave[] => {
    if (
      bien.mensajes_clave &&
      Array.isArray(bien.mensajes_clave) &&
      bien.mensajes_clave.length > 0
    ) {
      return bien.mensajes_clave as MensajeClave[];
    }
    return [];
  };

  // Inicializar anécdotas desde los datos existentes
  const inicializarAnecdotas = (): Anecdota[] => {
    if (bien.anecdotas && Array.isArray(bien.anecdotas) && bien.anecdotas.length > 0) {
      return bien.anecdotas as Anecdota[];
    }
    return [];
  };

  const [mensajesClave, setMensajesClave] = useState<MensajeClave[]>(
    inicializarMensajesClave
  );
  const [anecdotas, setAnecdotas] = useState<Anecdota[]>(
    inicializarAnecdotas
  );

  // Estado para el mensaje de bienvenida
  const [generarBienvenidaAuto, setGenerarBienvenidaAuto] = useState<boolean>(
    bien.generar_bienvenida_auto ?? true
  );

  // Añadir nuevo mensaje clave
  const agregarMensajeClave = () => {
    setMensajesClave([
      ...mensajesClave,
      { mensaje: "", desarrollo: "", fuente: "" },
    ]);
  };

  // Eliminar mensaje clave
  const eliminarMensajeClave = (index: number) => {
    setMensajesClave(mensajesClave.filter((_, i) => i !== index));
  };

  // Actualizar mensaje clave
  const actualizarMensajeClave = (
    index: number,
    campo: keyof MensajeClave,
    valor: string
  ) => {
    const nuevos = [...mensajesClave];
    nuevos[index] = { ...nuevos[index], [campo]: valor };
    setMensajesClave(nuevos);
  };

  // Añadir nueva anécdota
  const agregarAnecdota = () => {
    setAnecdotas([...anecdotas, { titulo: "", contenido: "", verificada: false }]);
  };

  // Eliminar anécdota
  const eliminarAnecdota = (index: number) => {
    setAnecdotas(anecdotas.filter((_, i) => i !== index));
  };

  // Actualizar anécdota
  const actualizarAnecdota = (
    index: number,
    campo: keyof Anecdota,
    valor: string | boolean
  ) => {
    const nuevos = [...anecdotas];
    nuevos[index] = { ...nuevos[index], [campo]: valor };
    setAnecdotas(nuevos);
  };

  return (
    <Form action={actualizarAction} className="space-y-6">
      {/* Narrativa central */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold border-b pb-2 text-gray-900">
          Narrativa central
        </h2>

        <div>
          <label
            htmlFor="tema_principal"
            className="text-sm font-medium leading-none block mb-1 text-gray-900"
          >
            Tema principal
          </label>
          <Input
            id="tema_principal"
            name="tema_principal"
            defaultValue={bien.tema_principal || ""}
            placeholder="Una frase: de qué va este objeto"
            className="mt-1"
          />
        </div>

        <div>
          <label
            htmlFor="subtemas"
            className="text-sm font-medium leading-none block mb-1 text-gray-900"
          >
            Subtemas (separados por comas)
          </label>
          <Input
            id="subtemas"
            name="subtemas"
            defaultValue={
              bien.subtemas && Array.isArray(bien.subtemas)
                ? bien.subtemas.join(", ")
                : ""
            }
            placeholder="Ej: Arquitectura, Historia, Arte"
            className="mt-1"
          />
        </div>

        <div>
          <label
            htmlFor="relato_interpretativo"
            className="text-sm font-medium leading-none block mb-1 text-gray-900"
          >
            Relato interpretativo
          </label>
          <Textarea
            id="relato_interpretativo"
            name="relato_interpretativo"
            defaultValue={bien.relato_interpretativo || ""}
            placeholder="Cuenta la historia y significado de este bien..."
            rows={8}
            className="mt-1"
          />
        </div>
      </div>

      {/* Mensajes clave */}
      <div className="space-y-4 border-t pt-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">
            Mensajes clave
          </h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={agregarMensajeClave}
          >
            Añadir mensaje clave
          </Button>
        </div>

        {mensajesClave.length > 0 ? (
          <div className="space-y-4">
            {mensajesClave.map((mensaje, index) => (
              <div
                key={index}
                className="border rounded-lg p-4 space-y-3 bg-white"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Mensaje {index + 1}
                  </span>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => eliminarMensajeClave(index)}
                  >
                    Eliminar
                  </Button>
                </div>

                <div>
                  <label
                    htmlFor={`mensaje-${index}`}
                    className="text-sm font-medium leading-none block mb-1 text-gray-900"
                  >
                    Mensaje
                  </label>
                  <Input
                    id={`mensaje-${index}`}
                    value={mensaje.mensaje}
                    onChange={(e) =>
                      actualizarMensajeClave(index, "mensaje", e.target.value)
                    }
                    placeholder="Mensaje principal"
                    className="mt-1"
                  />
                </div>

                <div>
                  <label
                    htmlFor={`desarrollo-${index}`}
                    className="text-sm font-medium leading-none block mb-1 text-gray-900"
                  >
                    Desarrollo
                  </label>
                  <Textarea
                    id={`desarrollo-${index}`}
                    value={mensaje.desarrollo}
                    onChange={(e) =>
                      actualizarMensajeClave(
                        index,
                        "desarrollo",
                        e.target.value
                      )
                    }
                    placeholder="Desarrollo del mensaje..."
                    rows={3}
                    className="mt-1"
                  />
                </div>

                <div>
                  <label
                    htmlFor={`fuente-${index}`}
                    className="text-sm font-medium leading-none block mb-1 text-gray-900"
                  >
                    Fuente
                  </label>
                  <Input
                    id={`fuente-${index}`}
                    value={mensaje.fuente}
                    onChange={(e) =>
                      actualizarMensajeClave(index, "fuente", e.target.value)
                    }
                    placeholder="Fuente de información"
                    className="mt-1"
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">
            No hay mensajes clave añadidos. Haz clic en "Añadir mensaje clave"
            para empezar.
          </p>
        )}

        {/* Campo oculto para enviar los mensajes clave como JSON */}
        <input
          type="hidden"
          name="mensajes_clave"
          value={JSON.stringify(mensajesClave)}
        />
      </div>

      {/* Anécdotas */}
      <div className="space-y-4 border-t pt-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Anécdotas</h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={agregarAnecdota}
          >
            Añadir anécdota
          </Button>
        </div>

        {anecdotas.length > 0 ? (
          <div className="space-y-4">
            {anecdotas.map((anecdota, index) => (
              <div
                key={index}
                className="border rounded-lg p-4 space-y-3 bg-white"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Anécdota {index + 1}
                  </span>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => eliminarAnecdota(index)}
                  >
                    Eliminar
                  </Button>
                </div>

                <div>
                  <label
                    htmlFor={`anecdota-titulo-${index}`}
                    className="text-sm font-medium leading-none block mb-1 text-gray-900"
                  >
                    Título
                  </label>
                  <Input
                    id={`anecdota-titulo-${index}`}
                    value={anecdota.titulo}
                    onChange={(e) =>
                      actualizarAnecdota(index, "titulo", e.target.value)
                    }
                    placeholder="Título de la anécdota"
                    className="mt-1"
                  />
                </div>

                <div>
                  <label
                    htmlFor={`anecdota-contenido-${index}`}
                    className="text-sm font-medium leading-none block mb-1 text-gray-900"
                  >
                    Contenido
                  </label>
                  <Textarea
                    id={`anecdota-contenido-${index}`}
                    value={anecdota.contenido}
                    onChange={(e) =>
                      actualizarAnecdota(index, "contenido", e.target.value)
                    }
                    placeholder="Cuenta la anécdota..."
                    rows={4}
                    className="mt-1"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`anecdota-verificada-${index}`}
                    checked={anecdota.verificada}
                    onChange={(e) =>
                      actualizarAnecdota(index, "verificada", e.target.checked)
                    }
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label
                    htmlFor={`anecdota-verificada-${index}`}
                    className="text-sm text-gray-700 cursor-pointer"
                  >
                    Verificada (histórica) — sin marcar es leyenda
                  </label>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">
            No hay anécdotas añadidas. Haz clic en "Añadir anécdota" para
            empezar.
          </p>
        )}

        {/* Campo oculto para enviar las anécdotas como JSON */}
        <input
          type="hidden"
          name="anecdotas"
          value={JSON.stringify(anecdotas)}
        />
      </div>

      {/* Preguntas provocadoras */}
      <div className="space-y-4 border-t pt-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Preguntas provocadoras
        </h2>

        <div>
          <label
            htmlFor="preguntas_provocadoras"
            className="text-sm font-medium leading-none block mb-1 text-gray-900"
          >
            Preguntas (una por línea, aparecerán como chips en el chat)
          </label>
          <Textarea
            id="preguntas_provocadoras"
            name="preguntas_provocadoras"
            defaultValue={
              bien.preguntas_provocadoras &&
              Array.isArray(bien.preguntas_provocadoras)
                ? bien.preguntas_provocadoras.join("\n")
                : ""
            }
            placeholder="¿Por qué fue construido aquí?&#10;¿Quién lo diseñó?&#10;¿Qué secreto esconde?"
            rows={6}
            className="mt-1"
          />
          <p className="text-xs text-gray-500 mt-1">
            Escribe una pregunta por línea. Estas aparecerán como chips
            sugeridos en el chat.
          </p>
        </div>
      </div>

      {/* Conexiones */}
      <div className="space-y-4 border-t pt-6">
        <h2 className="text-xl font-semibold text-gray-900">Conexiones</h2>

        <div>
          <label
            htmlFor="conexiones_actuales"
            className="text-sm font-medium leading-none block mb-1 text-gray-900"
          >
            Conexiones actuales (¿Qué tiene que ver conmigo hoy?)
          </label>
          <Textarea
            id="conexiones_actuales"
            name="conexiones_actuales"
            defaultValue={bien.conexiones_actuales || ""}
            placeholder="Explica cómo este bien se conecta con la vida actual, tradiciones, cultura contemporánea..."
            rows={6}
            className="mt-1"
          />
        </div>
      </div>

      {/* Mensaje de bienvenida */}
      <div className="space-y-4 border-t pt-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Mensaje de bienvenida
        </h2>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="generar_bienvenida_auto"
            name="generar_bienvenida_auto"
            checked={generarBienvenidaAuto}
            onChange={(e) => setGenerarBienvenidaAuto(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label
            htmlFor="generar_bienvenida_auto"
            className="text-sm font-medium text-gray-900 cursor-pointer"
          >
            Generar automáticamente con IA
          </label>
        </div>

        <div>
          <label
            htmlFor="mensaje_bienvenida"
            className="text-sm font-medium leading-none block mb-1 text-gray-900"
          >
            Mensaje personalizado
          </label>
          <Textarea
            id="mensaje_bienvenida"
            name="mensaje_bienvenida"
            defaultValue={bien.mensaje_bienvenida || ""}
            placeholder="Bienvenido. Soy..."
            rows={4}
            disabled={generarBienvenidaAuto}
            className="mt-1"
          />
          <p className="text-xs text-gray-500 mt-1">
            {generarBienvenidaAuto
              ? "Si está activado, la IA generará una bienvenida única basada en los datos del bien. Desactívalo para escribir tu propio mensaje."
              : "Escribe tu mensaje personalizado de bienvenida."}
          </p>
        </div>

        {/* Campo oculto para enviar el valor del toggle */}
        <input
          type="hidden"
          name="generar_bienvenida_auto"
          value={generarBienvenidaAuto ? "true" : "false"}
        />
      </div>

      {/* Control editorial */}
      <div className="space-y-4 border-t pt-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Control editorial
        </h2>

        <div>
          <label
            htmlFor="estado_capa_2"
            className="text-sm font-medium leading-none block mb-1 text-gray-900"
          >
            Estado de Capa 2
          </label>
          <select
            id="estado_capa_2"
            name="estado_capa_2"
            defaultValue={bien.estado_capa_2 || ""}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="">Seleccionar...</option>
            <option value="borrador">Borrador</option>
            <option value="revisada">Revisada</option>
            <option value="publicada">Publicada</option>
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
        <Button type="submit">Guardar Capa 2</Button>
      </div>
    </Form>
  );
}
