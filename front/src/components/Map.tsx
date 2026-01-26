import { MapContainer, TileLayer } from "react-leaflet";
import type { LatLngTuple } from "leaflet";

const ANTANANARIVO_CENTER: LatLngTuple = [-18.8792, 47.5079];
const DEFAULT_ZOOM = 13;

export default function MapPage()
{
    return (
        <div style={{ height: "100vh", width: "100vw" }}>
            <MapContainer
                center={ANTANANARIVO_CENTER}
                zoom={DEFAULT_ZOOM}
                style={{ height: "100%", width: "100%" }}
                scrollWheelZoom={true}
            >
                <TileLayer
                    url="http://localhost:8081/styles/basic/{z}/{x}/{y}.png"
                    attribution="© OpenStreetMap contributors"
                />
            </MapContainer>
        </div>
    );
}
