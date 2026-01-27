import React, { useState, useEffect } from 'react';
import L from 'leaflet';
import { 
  MapContainer, 
  TileLayer, 
  Marker, 
  Popup, 
  useMapEvents, 
  Tooltip 
} from 'react-leaflet';

import 'leaflet/dist/leaflet.css';

// --- 1. TYPES & CONFIGURATION ---

type PointType = 'circle' | 'square' | 'triangle';

interface BackendPointData {
  id: number;
  date: string;
  surface: number;
  budget: number;
  coordinates: [number, number];
  point_type_label: string;
  point_state_label: string;
  factories: string[];
  assigned_user: string;
}

interface MapPoint {
  id: number;
  lat: number;
  lng: number;
  type: PointType;
  backendData: BackendPointData;
}

// --- 2. ICÔNES SVG ---

const createIcon = (color: string, shape: 'circle' | 'square' | 'triangle') => {
  let svgContent = '';
  if (shape === 'circle') svgContent = `<circle cx="12" cy="12" r="8" fill="${color}" stroke="white" stroke-width="2"/>`;
  else if (shape === 'square') svgContent = `<rect x="4" y="4" width="16" height="16" fill="${color}" stroke="white" stroke-width="2"/>`;
  else if (shape === 'triangle') svgContent = `<polygon points="12,3 21,20 3,20" fill="${color}" stroke="white" stroke-width="2"/>`;

  return L.divIcon({
    className: '',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    html: `<svg width="24" height="24" viewBox="0 0 24 24" style="filter: drop-shadow(0px 2px 2px rgba(0,0,0,0.3));">${svgContent}</svg>`
  });
};

// --- 3. SIMULATION BACKEND ---

const simulateBackendFetch = (id: number, type: PointType, lat: number, lng: number): BackendPointData => {
  return {
    id: id,
    date: new Date().toISOString(),
    surface: Math.floor(Math.random() * 500) + 50,
    budget: Math.floor(Math.random() * 10000) + 1000,
    coordinates: [lat, lng],
    point_type_label: type === 'circle' ? 'Peu grave' : type === 'square' ? 'Grave' : 'Très grave',
    point_state_label: 'En attente',
    factories: ['Usine Alpha', 'Zone B'],
    assigned_user: 'admin_tana'
  };
};

// --- 4. COMPOSANT MAP ---

const MapClickHandler: React.FC<{ onMapClick: (lat: number, lng: number) => void }> = ({ onMapClick }) => {
  useMapEvents({ click(e) { onMapClick(e.latlng.lat, e.latlng.lng); } });
  return null;
};

const MapPage: React.FC = () => {
  const [points, setPoints] = useState<MapPoint[]>([]);
  const [selectedShape, setSelectedShape] = useState<PointType>('circle');
  const [isLegendOpen, setIsLegendOpen] = useState(true);

  const tanaPosition: [number, number] = [-18.9101, 47.5251];
  const tileUrl = "http://localhost:8081/styles/basic-preview/{z}/{x}/{y}.png";

  const handleMapClick = (lat: number, lng: number) => {
    const backendData = simulateBackendFetch(Date.now(), selectedShape, lat, lng);
    const newPoint: MapPoint = {
      id: backendData.id,
      lat,
      lng,
      type: selectedShape,
      backendData: backendData
    };
    setPoints((prev) => [...prev, newPoint]);
    console.log("📡 BACKEND POST: Point ajouté", backendData);
  };

  const handleDeletePoint = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setPoints((prev) => prev.filter((p) => p.id !== id));
    console.log(`🗑️ BACKEND DELETE: Point ID ${id} supprimé`);
  };

  const renderPoint = (point: MapPoint) => {
    let icon;
    if (point.type === 'circle') icon = createIcon('#3b82f6', 'circle');
    else if (point.type === 'square') icon = createIcon('#f97316', 'square');
    else icon = createIcon('#ef4444', 'triangle');

    return (
      <Marker key={point.id} position={[point.lat, point.lng]} icon={icon}>
        <Popup>
          <div className="text-center min-w-[140px]">
            <div className="font-bold text-slate-700 mb-1">Point #{point.id}</div>
            <div className="text-xs text-slate-500 mb-3">{point.backendData.point_type_label}</div>
            <button 
              onClick={(e) => handleDeletePoint(point.id, e)}
              className="bg-red-500 hover:bg-red-600 text-white text-xs font-bold py-1 px-3 rounded shadow transition-colors w-full"
            >
              Supprimer
            </button>
          </div>
        </Popup>
        <Tooltip direction="top" offset={[0, -20]} opacity={1}>
          <div className="bg-white p-2 rounded shadow text-xs text-slate-700 min-w-[200px]">
            <div className="font-bold border-b mb-1 pb-1 text-slate-900">Détails Backend</div>
            <ul className="space-y-1">
              <li><span className="font-semibold">Surface:</span> {point.backendData.surface} m²</li>
              <li><span className="font-semibold">Budget:</span> {point.backendData.budget} Ar</li>
              <li><span className="font-semibold">Usines:</span> {point.backendData.factories.join(', ')}</li>
            </ul>
          </div>
        </Tooltip>
      </Marker>
    );
  };

  // --- LOGIQUE DES COULEURS (Gravité) ---
  
  const getBtnClasses = (type: PointType) => {
    const baseClasses = "flex flex-1 flex-col items-center justify-center py-2 rounded border transition-all duration-200 gap-1";
    
    // Si l'onglet est actif
    if (selectedShape === type) {
      if (type === 'circle') return `${baseClasses} bg-blue-100 border-blue-500 text-blue-700 shadow-md`;
      if (type === 'square') return `${baseClasses} bg-orange-100 border-orange-500 text-orange-700 shadow-md`;
      if (type === 'triangle') return `${baseClasses} bg-red-100 border-red-500 text-red-700 shadow-md`;
    }
    
    // Inactif
    return `${baseClasses} bg-white text-slate-400 border-slate-200 hover:bg-slate-50 hover:text-slate-600`;
  };

  const IconCircle = () => <svg className="w-5 h-5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" fill="currentColor"/></svg>;
  const IconSquare = () => <svg className="w-5 h-5" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" fill="currentColor"/></svg>;
  const IconTriangle = () => <svg className="w-5 h-5" viewBox="0 0 24 24"><polygon points="12,3 21,20 3,20" fill="currentColor"/></svg>;
  const IconDots = () => <svg className="w-6 h-6 text-slate-700" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></svg>;

  return (
    <div className="h-full w-full flex flex-col bg-gray-100 font-sans relative">
      
      <header className="bg-white shadow-sm z-20 shrink-0">
        <div className="p-2 md:p-4 flex flex-col md:flex-row justify-between items-center gap-4">
          
          <h2 className="text-lg font-bold text-slate-700">VLC Serve</h2>
          
          {/* Sélecteur de forme : Colors + Distribution Mobile */}
          <div className={`flex ${selectedShape === 'circle' ? 'text-blue-500' : selectedShape === 'square' ? 'text-orange-500' : 'text-red-500'} bg-slate-50 p-2 rounded-lg w-full md:w-auto border border-slate-100`}>
            
            <button onClick={() => setSelectedShape('circle')} className={getBtnClasses('circle')} title="Peu grave">
              <IconCircle />
              <span className="hidden md:inline text-xs font-semibold">Peu grave</span>
            </button>

            <button onClick={() => setSelectedShape('square')} className={getBtnClasses('square')} title="Grave">
              <IconSquare />
              <span className="hidden md:inline text-xs font-semibold">Grave</span>
            </button>

            <button onClick={() => setSelectedShape('triangle')} className={getBtnClasses('triangle')} title="Très grave">
              <IconTriangle />
              <span className="hidden md:inline text-xs font-semibold">Très grave</span>
            </button>

          </div>
        </div>
      </header>

      <main className="flex-1 relative bg-slate-200">
        <MapContainer 
          center={tanaPosition} 
          zoom={13} 
          className="h-full w-full z-0"
          scrollWheelZoom={true}
        >
          <TileLayer url={tileUrl} attribution='&copy; Local TileServer' />
          <MapClickHandler onMapClick={handleMapClick} />
          {points.map(renderPoint)}

          {/* --- LÉGENDE RÉTRACTABLE --- */}
          {/* z-[9999] pour être ABSOLUMENT au dessus de la carte */}
          <div className="absolute top-4 right-4 z-[9999] pointer-events-none flex flex-col items-end">
            
            {isLegendOpen && (
              <div 
                onClick={(e) => {
                   e.stopPropagation(); 
                   setIsLegendOpen(false);
                }}
                className="bg-white/95 backdrop-blur p-4 rounded-lg shadow-xl border border-gray-200 pointer-events-auto cursor-pointer transition-all duration-300 transform origin-top-right"
              >
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700">Légende (Cliquez pour fermer)</h4>
                  <span className="text-gray-400 text-xs">✕</span>
                </div>
                <ul className="space-y-3 text-xs text-slate-700">
                  <li className="flex items-center gap-3"><svg width="16" height="16" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" fill="#3b82f6"/></svg><span>Peu grave</span></li>
                  <li className="flex items-center gap-3"><svg width="16" height="16" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" fill="#f97316"/></svg><span>Grave</span></li>
                  <li className="flex items-center gap-3"><svg width="16" height="16" viewBox="0 0 24 24"><polygon points="12,3 21,20 3,20" fill="#ef4444"/></svg><span>Très grave</span></li>
                </ul>
              </div>
            )}

            {!isLegendOpen && (
              <button 
                // UTILISATION DE onPointerDown au lieu de onClick
                // Cela capture l'événement DOIGT/CLIC avant que Leaflet ne le prenne
                onPointerDown={(e) => {
                  e.stopPropagation(); 
                  e.preventDefault(); // Double sécurité
                  setIsLegendOpen(true);
                }}
                className="bg-white shadow-2xl border-2 border-slate-300 pointer-events-auto hover:bg-gray-50 active:bg-gray-100 transition-all
                           w-14 h-14 rounded-full flex items-center justify-center z-[9999]"
                title="Ouvrir la légende"
              >
                <IconDots />
              </button>
            )}

          </div>
        </MapContainer>
      </main>
    </div>
  );
};

export default MapPage;