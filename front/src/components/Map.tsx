import React, { useEffect } from 'react';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

import 'leaflet/dist/leaflet.css';

import markerIconUrl from "leaflet/dist/images/marker-icon.png";
import markerRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import markerShadowUrl from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
  iconUrl: markerIconUrl,
  iconRetinaUrl: markerRetinaUrl,
  shadowUrl: markerShadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const MapPage: React.FC = () => {
  useEffect(() => {
    L.Marker.prototype.options.icon = DefaultIcon;
  }, []);

  const tanaPosition: [number, number] = [-18.9101, 47.5251];
  const tileUrl = "http://localhost:8081/styles/basic-preview/{z}/{x}/{y}.png";

  return (
    // IMPORTANT: h-full force le composant à remplir le parent
    <div className="h-full w-full flex flex-col bg-gray-100 font-sans">
      
      {/* HEADER SPÉCIFIQUE À LA CARTE */}
      <header className="bg-white shadow-sm p-4 z-20 shrink-0 flex justify-between items-center">
        <h2 className="text-lg font-bold text-slate-700">VLC Serve</h2>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          <span className="text-xs text-slate-500">En ligne</span>
        </div>
      </header>

      {/* LA CARTE PREND TOUT LE RESTE DE LA PLACE (flex-1) */}
      <main className="flex-1 relative bg-slate-200">
        <MapContainer 
          center={tanaPosition} 
          zoom={13} 
          className="h-full w-full z-0"
          scrollWheelZoom={true}
        >
          <TileLayer
            url={tileUrl}
            attribution='&copy; Local TileServer'
          />
          <Marker position={tanaPosition}>
            <Popup>
              <b>Analakely</b><br />
              Serveur actif.
            </Popup>
          </Marker>
        </MapContainer>
      </main>
    </div>
  );
};

export default MapPage;