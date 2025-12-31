import Map from "./Map";
import type { SeasonData } from "@/content.config";

interface MapIslandProps {
  seasonData: SeasonData;
}

export default function MapIsland(props: MapIslandProps) {
  return (
    <Map teams={props.seasonData.teams} events={props.seasonData.events} />
  );
}
