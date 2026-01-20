import React from 'react';
import L from 'leaflet';

import markerIconUrl from "leaflet/dist/images/marker-icon.png";
import markerRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import markerShadowUrl from "leaflet/dist/images/marker-shadow.png";
import { MapContainer } from 'react-leaflet/MapContainer';
import { TileLayer } from 'react-leaflet/TileLayer';
import { Popup } from 'react-leaflet/Popup';
import { Marker } from 'react-leaflet/Marker';

const DefaultIcon = L.icon({
  iconUrl: markerIconUrl,
  iconRetinaUrl: markerRetinaUrl,
  shadowUrl: markerShadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;


const MapPage: React.FC = () => {
  // Coordonnées d'Antananarivo (Analakely)
  const tanaPosition: [number, number] = [-18.9101, 47.5251];

  // URL de votre serveur Docker tileserver
  // /styles/basic-v2/ est un style par défaut souvent inclus. 
  // Vérifiez sur http://localhost:8081 le nom exact du style.
  const tileUrl = "http://localhost:8081/styles/basic-preview/{z}/{x}/{y}.png";

  return (
    <div style={{ padding: "20px" }}>
      <h1>Carte Offline d'Antananarivo</h1>
      <div style={{ height: "600px", width: "100%", border: "2px solid #ccc" }}>
        <MapContainer 
          center={tanaPosition} 
          zoom={13} 
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            url={tileUrl}
            attribution='&copy; Local TileServer - Antananarivo'
          />
          <Marker position={tanaPosition}>
            <Popup>
              Centre ville d'Antananarivo. <br /> Serveur Offline.
            </Popup>
          </Marker>
        </MapContainer>
      </div>
    </div>
  );
};

export default MapPage;