import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Icon } from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";

// Fix para los iconos en producción
delete Icon.Default.prototype._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

export default function MapaUbicacion({ geopoint }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Evitar renderizado en el servidor
  if (!isClient || !geopoint) {
    return (
      <div
        style={{
          height: "250px",
          width: "100%",
          borderRadius: "12px",
          backgroundColor: "#f0f0f0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        Cargando mapa...
      </div>
    );
  }

  const position = [geopoint.latitude, geopoint.longitude];

  return (
    <MapContainer
      center={position}
      zoom={14}
      style={{ height: "250px", width: "100%", borderRadius: "12px" }}
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={position}>
        <Popup>
          <a
            href={`https://www.google.com/maps?q=${geopoint.latitude},${geopoint.longitude}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Ver en Google Maps
          </a>
        </Popup>
      </Marker>
    </MapContainer>
  );
}
