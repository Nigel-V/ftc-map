import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import type { FTCEvent, Team } from './types';

interface MapProps {
    teams: Team[];
    events: FTCEvent[];
}

export default function Map(props: MapProps) {
    return <MapContainer center={[51.505, -0.09]} zoom={13} scrollWheelZoom={true} style={{height: "100%", width: "100%"}}>
  <TileLayer
    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
  />
  <Marker position={[51.505, -0.09]}>
    <Popup>
      A pretty CSS3 popup. <br /> Easily customizable.
    </Popup>
  </Marker>
</MapContainer>
;
}