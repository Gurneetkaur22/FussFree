import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Complaint } from "@/lib/types";
import "leaflet/dist/leaflet.css";

// Fix default marker icons (Vite asset resolution issue)
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const userIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const complaintIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Must be rendered INSIDE <MapContainer> to use useMap()
function LiveLocationUpdater({ position }: { position: [number, number] | null }) {
  const map = useMap();
  const didFlyRef = useRef(false);

  useEffect(() => {
    if (position && !didFlyRef.current) {
      // Fly to user only on the first GPS fix; after that let them pan freely
      map.flyTo(position, 14, { animate: true, duration: 1.2 });
      didFlyRef.current = true;
    }
  }, [position, map]);

  return null;
}

interface LocationMapProps {
  complaints: Complaint[];
}

const LocationMap = ({ complaints }: LocationMapProps) => {
  const [userPos, setUserPos] = useState<[number, number] | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setGeoError("Geolocation not supported by your browser.");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setUserPos([pos.coords.latitude, pos.coords.longitude]);
        setGeoError(null);
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setGeoError("Location permission denied. Enable it in browser settings.");
        }
      },
      { enableHighAccuracy: true, maximumAge: 5000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  const complaintMarkers = complaints
    .filter((c) => c.location && c.location !== "Not provided" && c.location.includes(","))
    .map((c) => {
      const [lat, lng] = c.location.split(",").map(Number);
      return { ...c, lat, lng };
    })
    .filter((c) => !isNaN(c.lat) && !isNaN(c.lng));

  // Default center: New Delhi — map will flyTo user on first GPS fix
  const defaultCenter: [number, number] = [28.6139, 77.209];

  return (
    <Card className="glass-card">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          🗺️ Live Location Map
          {userPos && (
            <span className="text-xs font-normal text-green-500 animate-pulse">● Live</span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-2">
        {geoError && (
          <p className="text-xs text-destructive mb-2 px-1">{geoError}</p>
        )}
        <div className="rounded-lg overflow-hidden" style={{ height: 350 }}>
          <MapContainer
            center={defaultCenter}
            zoom={12}
            style={{ height: "100%", width: "100%" }}
            scrollWheelZoom
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LiveLocationUpdater position={userPos} />
            {userPos && (
              <Marker position={userPos} icon={userIcon}>
                <Popup>📍 Your live location</Popup>
              </Marker>
            )}
            {complaintMarkers.map((c) => (
              <Marker key={c.id} position={[c.lat, c.lng]} icon={complaintIcon}>
                <Popup>
                  <strong>{c.category}</strong>
                  <br />
                  {c.description}
                  <br />
                  <em>
                    {c.status} — {c.priority}
                  </em>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
        <div className="flex gap-4 mt-2 text-xs text-muted-foreground justify-center">
          <span className="flex items-center gap-1">🔵 You</span>
          <span className="flex items-center gap-1">🔴 Complaints</span>
          {!userPos && !geoError && (
            <span className="text-yellow-500">⏳ Waiting for GPS…</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default LocationMap;
