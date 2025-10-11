import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export default function MapaUbicacion({ geopoint }) {
  const position = [geopoint.latitude, geopoint.longitude];

  return (
    <MapContainer
      center={position}
      zoom={14}
      style={{ height: "250px", width: "100%", borderRadius: "12px" }}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap"
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
