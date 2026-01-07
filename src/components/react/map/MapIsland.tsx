import * as React from "react";
import Map, { Marker } from "react-map-gl/maplibre";
import { useIsDarkMode } from "@/hooks/useIsDarkMode";
import type { FTCEvent, Team } from "@/content.config";
import PopupCard from "./PopupCard";

interface MapIslandProps {
  teams: Team[];
  events: FTCEvent[];
  year: number;
}

export default function MapIsland(props: MapIslandProps) {
  // TODO apply filters based on url params
  const teams = props.teams;
  const events = props.events;

  const [viewState, setViewState] = React.useState({
    longitude: 5.4025,
    latitude: 51.2194,
    zoom: 7,
  });

  const [popupInfo, setPopupInfo] = React.useState<Team | FTCEvent | null>(
    null
  );

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
      onClick={() => setPopupInfo(null)}
    >
      {teams.map((team) => (
        <Marker
          key={`marker-${team.number}`}
          longitude={team.coords.lng}
          latitude={team.coords.lat}
          anchor="bottom"
          onClick={(e) => {
            e.originalEvent.stopPropagation();
            setPopupInfo(team);
          }}
        />
      ))}
      {events.map((event) => (
        <Marker
          key={`marker-${event.code}`}
          longitude={event.coords.lng}
          latitude={event.coords.lat}
          color="red"
          anchor="bottom"
          onClick={(e) => {
            e.originalEvent.stopPropagation();
            setPopupInfo(event);
          }}
        />
      ))}

      {popupInfo && (
        <PopupCard
          content={popupInfo}
          onCloseCallback={() => setPopupInfo(null)}
          year={props.year}
        />
      )}
    </Map>
  );
}
