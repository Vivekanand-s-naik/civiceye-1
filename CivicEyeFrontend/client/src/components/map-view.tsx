// import { useEffect, useRef } from "react";
// import L from "leaflet";
// import "leaflet/dist/leaflet.css";
// import { MapPin } from "lucide-react";
// import { renderToString } from "react-dom/server";

// interface MapMarker {
//   id: string;
//   position: [number, number];
//   title: string;
//   status: "open" | "inprogress" | "resolved" | "violation";
//   category: string;
// }
// export interface MapViewProps {
//   markers: MapMarker[];
//   center: [number, number];
//   zoom: number;
//   className?: string;
//   onMarkerClick?: (id: string) => void;
//   heatmap?: boolean; // ✅ add this line
// }
// interface MapViewProps {
//   markers: MapMarker[];
//   center?: [number, number];
//   zoom?: number;
//   onMarkerClick?: (id: string) => void;
//   className?: string;
// }

// const statusColors = {
//   open: "#f59e0b",
//   inprogress: "#3b82f6",
//   resolved: "#10b981",
//   violation: "#ef4444",
// };

// export function MapView({
//   markers,
//   center = [40.7128, -74.006],
//   zoom = 12,
//   onMarkerClick,
//   className = "h-96 w-full rounded-lg",
// }: MapViewProps) {
//   const mapRef = useRef<HTMLDivElement>(null);
//   const mapInstanceRef = useRef<L.Map | null>(null);

//   useEffect(() => {
//     if (!mapRef.current || mapInstanceRef.current) return;

//     const map = L.map(mapRef.current).setView(center, zoom);

//     L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
//       attribution: '© OpenStreetMap contributors',
//     }).addTo(map);

//     mapInstanceRef.current = map;

//     return () => {
//       map.remove();
//       mapInstanceRef.current = null;
//     };
//   }, []);

//   useEffect(() => {
//     const map = mapInstanceRef.current;
//     if (!map) return;

//     map.eachLayer((layer) => {
//       if (layer instanceof L.Marker) {
//         map.removeLayer(layer);
//       }
//     });

//     markers.forEach((marker) => {
//       const iconHtml = renderToString(
//         <div
//           style={{
//             backgroundColor: statusColors[marker.status],
//             width: "32px",
//             height: "32px",
//             borderRadius: "50% 50% 50% 0",
//             transform: "rotate(-45deg)",
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//             border: "2px solid white",
//             boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
//           }}
//         >
//           <MapPin
//             style={{
//               transform: "rotate(45deg)",
//               width: "16px",
//               height: "16px",
//               color: "white",
//             }}
//           />
//         </div>
//       );

//       const customIcon = L.divIcon({
//         html: iconHtml,
//         className: "",
//         iconSize: [32, 32],
//         iconAnchor: [16, 32],
//         popupAnchor: [0, -32],
//       });

//       const mapMarker = L.marker(marker.position, { icon: customIcon })
//         .addTo(map)
//         .bindPopup(`<strong>${marker.title}</strong><br/>${marker.category}`);

//       if (onMarkerClick) {
//         mapMarker.on("click", () => onMarkerClick(marker.id));
//       }
//     });
//   }, [markers, onMarkerClick]);

//   useEffect(() => {
//     const map = mapInstanceRef.current;
//     if (!map) return;
//     map.setView(center, zoom);
//   }, [center, zoom]);

//   return <div ref={mapRef} className={className} data-testid="map-view" />;
// }
import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin } from "lucide-react";
import { renderToString } from "react-dom/server";

interface MapMarker {
  id: string;
  position: [number, number];
  title: string;
  status: "open" | "inprogress" | "resolved" | "violation";
  category: string;
}

export interface MapViewProps {
  markers: MapMarker[];
  center?: [number, number];
  zoom?: number;
  className?: string;
  onMarkerClick?: (id: string) => void;
  heatmap?: boolean; // ✅ included here properly
}

const statusColors = {
  open: "#f59e0b",
  inprogress: "#3b82f6",
  resolved: "#10b981",
  violation: "#ef4444",
};

export function MapView({
  markers,
  center = [40.7128, -74.006],
  zoom = 12,
  onMarkerClick,
  className = "h-96 w-full rounded-lg",
}: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  // ✅ Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current).setView(center, zoom);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© OpenStreetMap contributors',
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // ✅ Update markers dynamically
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Remove existing markers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) map.removeLayer(layer);
    });

    // Add markers
    markers.forEach((marker) => {
      const iconHtml = renderToString(
        <div
          style={{
            backgroundColor: statusColors[marker.status],
            width: "32px",
            height: "32px",
            borderRadius: "50% 50% 50% 0",
            transform: "rotate(-45deg)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "2px solid white",
            boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
          }}
        >
          <MapPin
            style={{
              transform: "rotate(45deg)",
              width: "16px",
              height: "16px",
              color: "white",
            }}
          />
        </div>
      );

      const customIcon = L.divIcon({
        html: iconHtml,
        className: "",
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
      });

      const mapMarker = L.marker(marker.position, { icon: customIcon })
        .addTo(map)
        .bindPopup(`<strong>${marker.title}</strong><br/>${marker.category}`);

      if (onMarkerClick) {
        mapMarker.on("click", () => onMarkerClick(marker.id));
      }
    });
  }, [markers, onMarkerClick]);

  // ✅ Update map view when center/zoom changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (map) map.setView(center, zoom);
  }, [center, zoom]);

  return <div ref={mapRef} className={className} data-testid="map-view" />;
}
