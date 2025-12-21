"use client";

import mapboxgl from "mapbox-gl";
import { useEffect, useRef, useState } from "react";
import "mapbox-gl/dist/mapbox-gl.css";
import { LocateFixed } from "lucide-react";
import { toast } from "sonner";

export interface Punto {
  id: string;
  orden: number;
  nombre: string;
  lat: number;
  lng: number;
  imagen?: string;
  mostrarImagen?: boolean; // Si true, muestra imagen en lugar del número
}

interface RutaMapProps {
  puntos: Punto[];
  polyline: [number, number][];
  onPuntoSelect: (punto: Punto) => void;
  puntoActivoId?: string;
}

export function RutaMap({
  puntos,
  polyline,
  onPuntoSelect,
  puntoActivoId,
}: RutaMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null
  );
  const userMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const mapInitializedRef = useRef(false);
  const puntosRef = useRef(puntos);
  const polylineRef = useRef(polyline);
  const onPuntoSelectRef = useRef(onPuntoSelect);

  // Actualizar refs cuando cambian
  useEffect(() => {
    puntosRef.current = puntos;
    polylineRef.current = polyline;
    onPuntoSelectRef.current = onPuntoSelect;
  }, [puntos, polyline, onPuntoSelect]);

  // Inicializar el mapa solo una vez
  useEffect(() => {
    if (!mapContainer.current || mapInitializedRef.current) {
      return;
    }

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) {
      console.warn("NEXT_PUBLIC_MAPBOX_TOKEN no está configurado");
      return;
    }

    mapboxgl.accessToken = token;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/albertxxxx/cmjbpebrh000201qv69rr3cx1",
      center: [
        puntosRef.current[0]?.lng || -6.2923,
        puntosRef.current[0]?.lat || 36.5297,
      ],
      zoom: 14,
    });

    map.current.on("load", () => {
      if (!map.current) {
        return;
      }

      // Añadir polilínea
      map.current.addSource("ruta", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: polylineRef.current,
          },
        },
      });

      // Línea de la ruta - usando amarillo claro para mejor visibilidad en mapa oscuro
      map.current.addLayer({
        id: "ruta-line",
        type: "line",
        source: "ruta",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "#FFD700", // Amarillo dorado
          "line-width": 6,
          "line-opacity": 0.9,
        },
      });

      // Añadir marcadores
      puntosRef.current.forEach((punto) => {
        const el = document.createElement("div");
        el.className = "ruta-marker";

        if (punto.mostrarImagen && punto.imagen) {
          el.classList.add("ruta-marker-image");
          const img = document.createElement("img");
          img.src = punto.imagen;
          img.alt = punto.nombre;
          img.onerror = () => {
            // Si falla la imagen, mostrar el número
            el.classList.remove("ruta-marker-image");
            el.innerHTML = `<span>${punto.orden}</span>`;
          };
          el.appendChild(img);
        } else {
          el.innerHTML = `<span>${punto.orden}</span>`;
        }

        if (puntoActivoId === punto.id) {
          el.classList.add("active");
        }

        el.addEventListener("click", () => {
          onPuntoSelectRef.current(punto);
        });

        const marker = new mapboxgl.Marker(el)
          .setLngLat([punto.lng, punto.lat])
          .addTo(map.current!);

        markersRef.current.push(marker);
      });

      mapInitializedRef.current = true;
    });

    return () => {
      if (map.current) {
        map.current.remove();
        mapInitializedRef.current = false;
      }
    };
  }, []);

  // Actualizar marcadores cuando cambia el punto activo y centrar el mapa
  useEffect(() => {
    if (!map.current || !mapContainer.current || !mapInitializedRef.current) {
      return;
    }

    // Actualizar clases de marcadores - quitar .active de todos primero
    const markerElements =
      mapContainer.current.querySelectorAll(".ruta-marker");
    markerElements.forEach((el) => {
      el.classList.remove("active");
    });

    // Añadir .active solo al marcador activo
    markerElements.forEach((el, index) => {
      const punto = puntosRef.current[index];
      if (punto && punto.id === puntoActivoId) {
        el.classList.add("active");
      }
    });

    // Centrar el mapa en el punto activo
    if (puntoActivoId) {
      const puntoActivo = puntosRef.current.find((p) => p.id === puntoActivoId);
      if (puntoActivo && map.current.isStyleLoaded()) {
        map.current.flyTo({
          center: [puntoActivo.lng, puntoActivo.lat],
          zoom: 15,
          duration: 500,
          essential: true,
        });
      }
    }
  }, [puntoActivoId]);

  // Actualizar posición del usuario
  useEffect(() => {
    if (!map.current || !userLocation) {
      return;
    }

    if (userMarkerRef.current) {
      userMarkerRef.current.setLngLat(userLocation);
    } else {
      const el = document.createElement("div");
      el.className = "user-location-marker";

      userMarkerRef.current = new mapboxgl.Marker(el)
        .setLngLat(userLocation)
        .addTo(map.current);
    }
  }, [userLocation]);

  // Watch position solo cuando ya tenemos ubicación (para actualizarla en tiempo real)
  useEffect(() => {
    if (!userLocation || !("geolocation" in navigator)) {
      return;
    }

    // Una vez que tenemos ubicación, empezar a seguirla
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { longitude, latitude } = position.coords;
        setUserLocation([longitude, latitude]);
      },
      () => {
        // Si falla el watch, no hacer nada (puede ser que se perdió la señal)
      },
      { enableHighAccuracy: true }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [userLocation]);

  const handleLocationClick = () => {
    // Si ya tenemos ubicación, centrar
    if (userLocation) {
      if (!map.current || !mapInitializedRef.current) {
        return;
      }
      map.current.flyTo({
        center: userLocation,
        zoom: 16,
        duration: 500,
        essential: true,
      });
      return;
    }

    // Si no, solicitar permiso explícitamente
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { longitude, latitude } = position.coords;
          const newLocation: [number, number] = [longitude, latitude];
          setUserLocation(newLocation);
          if (map.current && mapInitializedRef.current) {
            map.current.flyTo({
              center: newLocation,
              zoom: 16,
              duration: 500,
              essential: true,
            });
          }
        },
        (error) => {
          // Manejar diferentes tipos de errores
          if (error.code === error.PERMISSION_DENIED) {
            toast.error("Activa la ubicación en tu dispositivo");
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            toast.error("No se pudo obtener tu ubicación");
          } else {
            toast.error("Error al obtener la ubicación");
          }
        },
        { enableHighAccuracy: true, timeout: 10_000 }
      );
    } else {
      toast.error("Tu navegador no soporta geolocalización");
    }
  };

  return (
    <div className="relative h-full w-full">
      <div className="h-full w-full" ref={mapContainer} />
      <button
        aria-label="Centrar en mi ubicación"
        className="location-button"
        onClick={handleLocationClick}
        type="button"
      >
        <LocateFixed className="h-5 w-5" style={{ color: "#fff" }} />
      </button>
    </div>
  );
}
