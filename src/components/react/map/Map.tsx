import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import type { FTCEvent, Team } from "@/content.config";

interface MapProps {
  teams: Team[];
  events: FTCEvent[];
}

export default function Map(props: MapProps) {
  {
    props.events.map((event) => console.log(event));
  }
  return (
    <MapContainer
      center={[51.2194, 5.4025]}
      zoom={7}
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
            {team.org}
            <br />
            Rookie Year: {team.rookieYear}
          </Popup>
        </Marker>
      ))}
      {props.events.map((event) => (
        <Marker
          key={event.code}
          position={[event.coords.lat, event.coords.lng]}
        >
          <Popup>
            <strong>{event.name}</strong>
            <br />
            {event.venue}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
