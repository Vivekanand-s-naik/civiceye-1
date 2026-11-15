import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";

export default function MapView() {
  const [violations, setViolations] = useState<any[]>([]);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    setTimeout(() => {
      setViolations([
        { id: 1, name: "Illegal Dumping", coords: [12.9716, 77.5946] },
        { id: 2, name: "Traffic Violation", coords: [12.935, 77.614] },
        { id: 3, name: "Streetlight Issue", coords: [12.958, 77.61] },
      ]);
    }, 500);
  }, []);

  const filtered = violations.filter(v => v.name.toLowerCase().includes(filter.toLowerCase()));

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">City Violation Map</h1>
      <Input placeholder="Search issue..." value={filter} onChange={e => setFilter(e.target.value)} className="max-w-sm mb-4" />
      <div className="h-[500px] rounded-xl overflow-hidden shadow-md">
        <MapContainer center={[12.9716, 77.5946]} zoom={12} style={{ height: "100%", width: "100%" }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {filtered.map(v => (
            <Marker key={v.id} position={v.coords}>
              <Popup>
                <b>{v.name}</b><br />Location ID: {v.id}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
