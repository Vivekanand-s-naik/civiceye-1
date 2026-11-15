import { MapView } from "../map-view";

export default function MapViewExample() {
  const markers = [
    {
      id: "1",
      position: [40.7128, -74.006] as [number, number],
      title: "Broken Streetlight",
      status: "open" as const,
      category: "Street Light",
    },
    {
      id: "2",
      position: [40.7589, -73.9851] as [number, number],
      title: "Pothole",
      status: "inprogress" as const,
      category: "Road Damage",
    },
    {
      id: "3",
      position: [40.7484, -73.9857] as [number, number],
      title: "Garbage Overflow",
      status: "resolved" as const,
      category: "Garbage",
    },
  ];

  return (
    <div className="p-8">
      <MapView
        markers={markers}
        center={[40.7128, -74.006]}
        zoom={12}
        onMarkerClick={(id) => console.log("Marker clicked:", id)}
      />
    </div>
  );
}
