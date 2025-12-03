export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// Tipos auxiliares para estructuras JSONB
export type Agente = {
  tipo: string;
  nombre: string;
  fecha?: string;
  actuacion?: string;
};

export type Bibliografia = {
  titulo: string;
  autor?: string;
  referencia?: string;
  url?: string;
};

export type MensajeClave = {
  mensaje: string;
  desarrollo?: string;
  fuente?: string;
};

export type Anecdota = {
  titulo: string;
  contenido: string;
  verificada: boolean;
};

export type ConexionOtroBien = {
  bien_id: string;
  tipo_conexion: "temática" | "geográfica" | "cronológica" | "estilística";
  descripcion: string;
};

export type DescripcionSensorial = {
  sentido: "vista" | "tacto" | "sonido" | "espacio";
  descripcion: string;
};

export type TemaSensible = {
  tema:
    | "esclavitud"
    | "colonialismo"
    | "expolio"
    | "religión"
    | "guerra_civil"
    | "otro";
  contexto: string;
  matices?: string;
  fuentes?: string[];
};

export type GuionAudio = {
  gancho: {
    tipo: "pregunta" | "dato" | "sensorial" | "temporal";
    texto: string;
  };
  desarrollo: {
    tema_elegido: string;
    puntos: Array<{
      texto: string;
      referencia_visual?: string;
    }>;
  };
  remate: {
    tipo: "reflexion" | "conexion" | "invitacion" | "dato";
    texto: string;
  };
};

export type ReferenciaVisual = {
  momento: "al inicio" | "en el desarrollo" | "al final";
  instruccion: string;
  que_vera: string;
};

export interface Database {
  public: {
    Tables: {
      bienes: {
        Row: {
          id: string;
          // Identificación
          denominacion: string;
          denominacion_alternativa: string[] | null;
          // Origen / fuente externa
          source_system: string | null;
          source_record_id: string | null;
          source_code: string | null;
          source_url: string | null;
          // Clasificación
          tipo_contenido:
            | "inmueble"
            | "mueble"
            | "inmaterial"
            | "ruta"
            | "paisaje"
            | null;
          caracterizacion: string | null;
          tipologia: string[] | null;
          periodos: string[] | null;
          cronologia_inicio: number | null;
          cronologia_fin: number | null;
          estilos: string[] | null;
          proteccion: string | null;
          // Localización
          direccion: string | null;
          municipio: string | null;
          provincia: string | null;
          region: string | null;
          pais: string | null;
          lat: number | null;
          lon: number | null;
          direccion_humana: string | null;
          indicaciones_llegada: string | null;
          // Capa 1: Textos
          descripcion_fisica: string | null;
          descripcion_artistica: string | null;
          datos_historicos: string | null;
          agentes: Json | null;
          bibliografia: Json | null;
          // Capa 2: Interpretación
          tiene_capa_2: boolean | null;
          estado_capa_2: "borrador" | "revisada" | "publicada" | null;
          tema_principal: string | null;
          subtemas: string[] | null;
          relato_interpretativo: string | null;
          mensajes_clave: Json | null;
          anecdotas: Json | null;
          preguntas_provocadoras: string[] | null;
          conexiones_actuales: string | null;
          conexiones_otros_bienes: Json | null;
          descripciones_sensoriales: Json | null;
          temas_sensibles: Json | null;
          autor_capa_2: string | null;
          fecha_capa_2: string | null;
          // Audioguía
          tiene_audioguia: boolean | null;
          estado_audioguia: "borrador" | "revisada" | "publicada" | null;
          duracion_objetivo: number | null;
          nivel_importancia: "destacado" | "importante" | "menor" | null;
          guion_audio: Json | null;
          referencias_visuales: Json | null;
          tono_audioguia: string | null;
          autor_audioguia: string | null;
          fecha_audioguia: string | null;
          // Sistema
          completitud_ficha: "rica" | "media" | "pobre" | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          denominacion: string;
          denominacion_alternativa?: string[] | null;
          source_system?: string | null;
          source_record_id?: string | null;
          source_code?: string | null;
          source_url?: string | null;
          tipo_contenido?:
            | "inmueble"
            | "mueble"
            | "inmaterial"
            | "ruta"
            | "paisaje"
            | null;
          caracterizacion?: string | null;
          tipologia?: string[] | null;
          periodos?: string[] | null;
          cronologia_inicio?: number | null;
          cronologia_fin?: number | null;
          estilos?: string[] | null;
          proteccion?: string | null;
          direccion?: string | null;
          municipio?: string | null;
          provincia?: string | null;
          region?: string | null;
          pais?: string | null;
          lat?: number | null;
          lon?: number | null;
          direccion_humana?: string | null;
          indicaciones_llegada?: string | null;
          descripcion_fisica?: string | null;
          descripcion_artistica?: string | null;
          datos_historicos?: string | null;
          agentes?: Json | null;
          bibliografia?: Json | null;
          tiene_capa_2?: boolean | null;
          estado_capa_2?: "borrador" | "revisada" | "publicada" | null;
          tema_principal?: string | null;
          subtemas?: string[] | null;
          relato_interpretativo?: string | null;
          mensajes_clave?: Json | null;
          anecdotas?: Json | null;
          preguntas_provocadoras?: string[] | null;
          conexiones_actuales?: string | null;
          conexiones_otros_bienes?: Json | null;
          descripciones_sensoriales?: Json | null;
          temas_sensibles?: Json | null;
          autor_capa_2?: string | null;
          fecha_capa_2?: string | null;
          tiene_audioguia?: boolean | null;
          estado_audioguia?: "borrador" | "revisada" | "publicada" | null;
          duracion_objetivo?: number | null;
          nivel_importancia?: "destacado" | "importante" | "menor" | null;
          guion_audio?: Json | null;
          referencias_visuales?: Json | null;
          tono_audioguia?: string | null;
          autor_audioguia?: string | null;
          fecha_audioguia?: string | null;
          completitud_ficha?: "rica" | "media" | "pobre" | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          denominacion?: string;
          denominacion_alternativa?: string[] | null;
          source_system?: string | null;
          source_record_id?: string | null;
          source_code?: string | null;
          source_url?: string | null;
          tipo_contenido?:
            | "inmueble"
            | "mueble"
            | "inmaterial"
            | "ruta"
            | "paisaje"
            | null;
          caracterizacion?: string | null;
          tipologia?: string[] | null;
          periodos?: string[] | null;
          cronologia_inicio?: number | null;
          cronologia_fin?: number | null;
          estilos?: string[] | null;
          proteccion?: string | null;
          direccion?: string | null;
          municipio?: string | null;
          provincia?: string | null;
          region?: string | null;
          pais?: string | null;
          lat?: number | null;
          lon?: number | null;
          direccion_humana?: string | null;
          indicaciones_llegada?: string | null;
          descripcion_fisica?: string | null;
          descripcion_artistica?: string | null;
          datos_historicos?: string | null;
          agentes?: Json | null;
          bibliografia?: Json | null;
          tiene_capa_2?: boolean | null;
          estado_capa_2?: "borrador" | "revisada" | "publicada" | null;
          tema_principal?: string | null;
          subtemas?: string[] | null;
          relato_interpretativo?: string | null;
          mensajes_clave?: Json | null;
          anecdotas?: Json | null;
          preguntas_provocadoras?: string[] | null;
          conexiones_actuales?: string | null;
          conexiones_otros_bienes?: Json | null;
          descripciones_sensoriales?: Json | null;
          temas_sensibles?: Json | null;
          autor_capa_2?: string | null;
          fecha_capa_2?: string | null;
          tiene_audioguia?: boolean | null;
          estado_audioguia?: "borrador" | "revisada" | "publicada" | null;
          duracion_objetivo?: number | null;
          nivel_importancia?: "destacado" | "importante" | "menor" | null;
          guion_audio?: Json | null;
          referencias_visuales?: Json | null;
          tono_audioguia?: string | null;
          autor_audioguia?: string | null;
          fecha_audioguia?: string | null;
          completitud_ficha?: "rica" | "media" | "pobre" | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      imagenes_bienes: {
        Row: {
          id: string;
          bien_id: string;
          url: string;
          titulo: string | null;
          autor: string | null;
          fecha: string | null;
          institucion: string | null;
          licencia: string | null;
          es_principal: boolean | null;
          orden: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          bien_id: string;
          url: string;
          titulo?: string | null;
          autor?: string | null;
          fecha?: string | null;
          institucion?: string | null;
          licencia?: string | null;
          es_principal?: boolean | null;
          orden?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          bien_id?: string;
          url?: string;
          titulo?: string | null;
          autor?: string | null;
          fecha?: string | null;
          institucion?: string | null;
          licencia?: string | null;
          es_principal?: boolean | null;
          orden?: number | null;
          created_at?: string;
        };
      };
      rutas: {
        Row: {
          id: string;
          nombre: string;
          descripcion: string | null;
          tema: string | null;
          duracion_estimada: string | null;
          distancia_km: number | null;
          dificultad: "fácil" | "media" | "exigente" | null;
          estado: "borrador" | "publicada" | null;
          tipo_acceso: "gratis" | "premium" | null;
          precio: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          nombre: string;
          descripcion?: string | null;
          tema?: string | null;
          duracion_estimada?: string | null;
          distancia_km?: number | null;
          dificultad?: "fácil" | "media" | "exigente" | null;
          estado?: "borrador" | "publicada" | null;
          tipo_acceso?: "gratis" | "premium" | null;
          precio?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          nombre?: string;
          descripcion?: string | null;
          tema?: string | null;
          duracion_estimada?: string | null;
          distancia_km?: number | null;
          dificultad?: "fácil" | "media" | "exigente" | null;
          estado?: "borrador" | "publicada" | null;
          tipo_acceso?: "gratis" | "premium" | null;
          precio?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      rutas_bienes: {
        Row: {
          id: string;
          ruta_id: string;
          bien_id: string;
          orden: number;
          texto_transicion: string | null;
          tiempo_entre_puntos: string | null;
          es_parada_principal: boolean | null;
        };
        Insert: {
          id?: string;
          ruta_id: string;
          bien_id: string;
          orden: number;
          texto_transicion?: string | null;
          tiempo_entre_puntos?: string | null;
          es_parada_principal?: boolean | null;
        };
        Update: {
          id?: string;
          ruta_id?: string;
          bien_id?: string;
          orden?: number;
          texto_transicion?: string | null;
          tiempo_entre_puntos?: string | null;
          es_parada_principal?: boolean | null;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}