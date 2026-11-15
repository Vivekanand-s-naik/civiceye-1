import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Search, RefreshCw, AlertTriangle, Layers } from "lucide-react";
import L from "leaflet";

// Fix default leaflet marker icon issue in react
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface MapPoint {
  id: number | string;
  name: string;
  category: string;
  status: string;
  address: string;
  coords: [number, number];
  report_type: string;
  imageUrl?: string;
}

export default function MapView() {
  const [filter, setFilter] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  const { data: points = [], isLoading, refetch } = useQuery<MapPoint[]>({
    queryKey: ["mapDataPoints"],
    queryFn: async () => {
      const res = await fetch("/api/map-data");
      if (!res.ok) throw new Error("Failed to load map points");
      return res.json();
    },
  });

  const filtered = points.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(filter.toLowerCase()) ||
      p.address.toLowerCase().includes(filter.toLowerCase()) ||
      p.category.toLowerCase().includes(filter.toLowerCase());

    if (selectedCategory === "ALL") return matchesSearch;
    return matchesSearch && p.category.toLowerCase().includes(selectedCategory.toLowerCase());
  });

  const categories = ["ALL", "pothole", "garbage", "streetlight", "water", "parking", "traffic"];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">City Civic & Violation Map</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Geographic visualization of reported civic hazards and traffic violations across urban zones
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" /> Refresh GPS Points
        </Button>
      </div>

      {/* Filter and Category Bar */}
      <Card className="border-border/60">
        <CardContent className="p-3 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by area or hazard..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="pl-9 h-8 text-xs"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {categories.map((c) => (
              <Button
                key={c}
                variant={selectedCategory === c ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(c)}
                className={`text-xs h-7 capitalize ${
                  selectedCategory === c ? "bg-blue-600 text-white" : "text-muted-foreground"
                }`}
              >
                {c}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Leaflet Map Canvas */}
      <div className="h-[600px] rounded-2xl overflow-hidden shadow-lg border border-border/60 relative z-10">
        <MapContainer
          center={[12.9716, 77.5946]}
          zoom={12}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {filtered.map((point) => (
            <Marker key={`${point.report_type}-${point.id}`} position={point.coords}>
              <Popup className="custom-leaflet-popup">
                <div className="w-56 space-y-2 p-1">
                  {point.imageUrl && (
                    <div className="h-28 w-full rounded-md overflow-hidden bg-slate-100">
                      <img
                        src={point.imageUrl}
                        alt={point.name}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/uploads/issues/default.jpg";
                        }}
                      />
                    </div>
                  )}
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                        {point.report_type}
                      </span>
                      <span className="text-[10px] font-semibold uppercase bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">
                        {point.status}
                      </span>
                    </div>
                    <p className="font-bold text-xs text-foreground line-clamp-1">{point.name}</p>
                    <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3 flex-shrink-0 text-red-500" />
                      <span className="truncate">{point.address}</span>
                    </p>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
