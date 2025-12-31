import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import type { FTCEvent, Team } from "@/content.config";

interface MapProps {
  teams: Team[];
  events: FTCEvent[];
}

export default function Map(props: MapProps) {
  return (
    <MapContainer
      center={[51.505, -0.09]}
      zoom={13}
      scrollWheelZoom={true}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        subdomains="abcd"
        maxZoom={20}
        minZoom={2}
      />
      {props.teams.map((team) => (
        <Marker
          key={`ftc${team.number}`}
          position={[team.coords.lat, team.coords.lng]}
        >
          <Popup>
            <strong>
              {team.number} - {team.name}
            </strong>
            <br />
            {team.organization}
            <br />
            Rookie Year: {team.rookieYear}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
