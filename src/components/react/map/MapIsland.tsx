import * as React from "react";
import Map, { Marker } from "react-map-gl/maplibre";
import { useIsDarkMode } from "@/hooks/useIsDarkMode";
import type { FTCEvent, Team } from "@/content.config";

interface MapIslandProps {
  teams: Team[];
  events: FTCEvent[];
}

export default function MapIsland(props: MapIslandProps) {
  const [viewState, setViewState] = React.useState({
    longitude: 5.4025,
    latitude: 51.2194,
    zoom: 7,
  });

  const isDarkMode = useIsDarkMode();

  return (
    <Map
      {...viewState}
      onMove={(evt) => setViewState(evt.viewState)}
      style={{ height: "100%", width: "100%" }}
      mapStyle={
        isDarkMode
          ? "https://tiles.openfreemap.org/styles/dark"
          : "https://tiles.openfreemap.org/styles/positron"
      }
    >
      {props.teams.map((team) => (
        <Marker
          key={`ftc${team.number}`}
          longitude={team.coords.lng}
          latitude={team.coords.lat}
        />
      ))}
      {props.events.map((event) => (
        <Marker
          key={event.code}
          longitude={event.coords.lng}
          latitude={event.coords.lat}
          color="red"
        />
      ))}
    </Map>
  );
}
