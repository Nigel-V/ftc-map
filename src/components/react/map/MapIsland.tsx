import * as React from "react";
import Map, { Source, Layer, Popup } from "react-map-gl/maplibre";
import type { MapLayerMouseEvent } from "maplibre-gl";
import type { FeatureCollection, Feature, Point } from "geojson";
import { useMemo, useState } from "react";
import { useIsDarkMode } from "@/hooks/useIsDarkMode";
import type { FTCEvent, Team } from "@/content.config";
import PopupCard from "./PopupCard";

interface MapIslandProps {
  teams: Team[];
  events: FTCEvent[];
  year: number;
}

export default function MapIsland(props: MapIslandProps) {
  const [popupInfo, setPopupInfo] = useState<Team | FTCEvent | null>(null);
  const isDarkMode = useIsDarkMode();

  // 1. Transform your custom data into GeoJSON
  const geojsonData: FeatureCollection<Point> = useMemo(() => {
    const teamFeatures: Feature<Point>[] = props.teams.map((t) => ({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [t.coords.lng, t.coords.lat],
      },
      properties: { originalData: JSON.stringify(t), isEvent: false },
    }));

    const eventFeatures: Feature<Point>[] = props.events.map((e) => ({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [e.coords.lng, e.coords.lat],
      },
      properties: { originalData: JSON.stringify(e), isEvent: true },
    }));

    return {
      type: "FeatureCollection",
      features: [...teamFeatures, ...eventFeatures],
    };
  }, [props.teams, props.events]);

  // 2. Click handler for layers
  const onClick = (event: MapLayerMouseEvent) => {
    const feature = event.features?.[0];
    if (!feature) return;

    if (feature.layer.id === "clusters") {
      // Zoom into cluster logic (standard MapLibre)
      return;
    }

    // Set popup info from the feature properties
    setPopupInfo(feature.properties as any);
  };

  return (
    <Map
      initialViewState={{ longitude: 5.4025, latitude: 51.2194, zoom: 7 }}
      mapStyle={
        isDarkMode
          ? "https://tiles.openfreemap.org/styles/dark"
          : "https://tiles.openfreemap.org/styles/positron"
      }
      onClick={onClick}
      interactiveLayerIds={["clusters", "unclustered-point"]}
    >
      <Source
        id="ftc-data"
        type="geojson"
        data={geojsonData}
        cluster={true}
        clusterMaxZoom={14}
        clusterRadius={50}
      >
        {/* Cluster Circle Layer */}
        <Layer
          id="clusters"
          type="circle"
          filter={["has", "point_count"]}
          paint={{
            "circle-color": [
              "step",
              ["get", "point_count"],
              "#51bbd6",
              10,
              "#f1f075",
              50,
              "#f28cb1",
            ],
            "circle-radius": [
              "step",
              ["get", "point_count"],
              20,
              10,
              30,
              50,
              40,
            ],
          }}
        />

        {/* Cluster Text Layer (Count) */}
        <Layer
          id="cluster-count"
          type="symbol"
          filter={["has", "point_count"]}
          layout={{
            "text-field": "{point_count_abbreviated}",
            "text-font": ["Open Sans Bold"],
            "text-size": 12,
          }}
        />

        {/* Individual Points Layer */}
        <Layer
          id="unclustered-point"
          type="circle"
          filter={["!", ["has", "point_count"]]}
          paint={{
            "circle-color": ["case", ["get", "isEvent"], "red", "#3b82f6"],
            "circle-radius": 8,
            "circle-stroke-width": 1,
            "circle-stroke-color": "#fff",
          }}
        />
      </Source>

      {popupInfo && (
        <Popup
          longitude={(popupInfo as any).coords.lng}
          latitude={(popupInfo as any).coords.lat}
          onClose={() => setPopupInfo(null)}
        >
          <PopupCard
            content={popupInfo}
            year={props.year}
            onCloseCallback={() => setPopupInfo(null)}
          />
        </Popup>
      )}
    </Map>
  );
}
