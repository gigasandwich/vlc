import React, { useState, useEffect } from 'react';
import L from 'leaflet';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Tooltip
} from 'react-leaflet';

import 'leaflet/dist/leaflet.css';
import { backendURL } from '../constant';
import { formatDate } from '../utils';

// --- 1. TYPES & CONFIGURATION ---

type PointType = 'circle' | 'square' | 'triangle' | 'all';

interface BackendPointData {
  id: number;
  date?: string;
  surface?: number;
  budget?: number;
  lat?: number | null;
  lon?: number | null;
  stateId?: number | null;
  stateLabel?: string | null;
  typeId?: number | null;
  typeLabel?: string | null;
  // legacy names sometimes used by other endpoints
  type_label?: string | null;
  factoryLabels?: string;
  assigned_user?: string;
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

// --- 3. FETCH BACKEND ---

// Map backend type label to local point shape
const mapTypeFromLabel = (label?: string | null): PointType => {
  if (!label) return 'circle';
  const l = label.toLowerCase();
  if (l.includes('peu')) return 'circle';
  if (l.includes('tres') || l.includes('très')) return 'triangle';
  return 'square';
};

// --- 4. COMPOSANT MAP ---

// No MapClickHandler: we no longer add points by clicking on the map.

const MapPage: React.FC = () => {
  const [allPoints, setAllPoints] = useState<MapPoint[]>([]);
  const [selectedShape, setSelectedShape] = useState<PointType>('all');
  const [isLegendOpen, setIsLegendOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tanaPosition: [number, number] = [-18.9101, 47.5251];
  const tileUrl = "http://localhost:8081/styles/basic-preview/{z}/{x}/{y}.png";

  // Fetch points from backend and map to MapPoint
  const fetchPoints = async () => {
    setError(null);
    try {
      const res = await fetch(`${backendURL}/points`);
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP ${res.status}: ${text}`);
      }
      const json = await res.json();
      const payload = json && (json.payload ?? json.data ?? json);
      if (!Array.isArray(payload)) {
        throw new Error('Unexpected points response format');
      }

      const mapped: MapPoint[] = payload
        .map((dto: any) => {
          const lat = dto.lat ?? dto.latitude ?? null;
          const lon = dto.lon ?? dto.longitude ?? null;
          return {
            id: dto.id,
            lat: lat ?? 0,
            lng: lon ?? 0,
            type: mapTypeFromLabel(dto.typeLabel ?? dto.type_label ?? dto.point_type_label),
            backendData: dto as BackendPointData,
          } as MapPoint;
        })
        .filter((p: MapPoint) => p.lat !== null && p.lng !== null);

      setAllPoints(mapped);
    } catch (e: any) {
      console.error('Failed to fetch points', e);
      setError(e.message ?? String(e));
      setAllPoints([]);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchPoints().finally(() => setLoading(false));
  }, []);

  const handleDeletePoint = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setAllPoints((prev) => prev.filter((p) => p.id !== id));
    console.log(`🗑️ (local) Point ID ${id} supprimé`);
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
            <div className="text-xs text-slate-500 mb-3">{point.backendData.typeLabel ?? point.backendData.type_label}</div>
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
              <li><span className="font-semibold">Date:</span> {formatDate(point.backendData.date) ?? '-'}</li>
              <li><span className="font-semibold">status:</span> {point.backendData.stateLabel  ?? '-'}</li>
              <li><span className="font-semibold">Surface:</span> {point.backendData.surface ?? '-'} m²</li>
              <li><span className="font-semibold">Budget:</span> {point.backendData.budget ?? '-'} Ar</li>
              <li><span className="font-semibold">Usines:</span> {point.backendData.factoryLabels ?? '-'}</li>
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

  // compute displayed points based on selectedShape ('all' shows everything)
  const displayedPoints = selectedShape === 'all' ? allPoints : allPoints.filter(p => p.type === selectedShape);

  // header color depending on the active filter
  const headerColorClass = selectedShape === 'circle' ? 'text-blue-500' : selectedShape === 'square' ? 'text-orange-500' : selectedShape === 'triangle' ? 'text-red-500' : 'text-slate-700';

  return (
    <div className="h-full w-full flex flex-col bg-gray-100 font-sans relative">
      
      <header className="bg-white shadow-sm z-20 shrink-0">
        <div className="p-2 md:p-4 flex flex-col md:flex-row justify-between items-center gap-4">
          
          <h2 className="text-lg font-bold text-slate-700">VLC Serve</h2>
          
          {/* Sélecteur de forme : Colors + Distribution Mobile */}
          <div className={`flex ${headerColorClass} bg-slate-50 p-2 rounded-lg w-full md:w-auto border border-slate-100`}>
            
            <button onClick={() => setSelectedShape(prev => prev === 'circle' ? 'all' : 'circle')} className={getBtnClasses('circle')} title="Peu grave">
              <IconCircle />
              <span className="hidden md:inline text-xs font-semibold">Peu grave</span>
            </button>

            <button onClick={() => setSelectedShape(prev => prev === 'square' ? 'all' : 'square')} className={getBtnClasses('square')} title="Grave">
              <IconSquare />
              <span className="hidden md:inline text-xs font-semibold">Grave</span>
            </button>

            <button onClick={() => setSelectedShape(prev => prev === 'triangle' ? 'all' : 'triangle')} className={getBtnClasses('triangle')} title="Très grave">
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
          {loading && (
            <div className="absolute top-4 left-4 z-[9999] p-2 bg-white rounded shadow text-xs">Chargement des points…</div>
          )}
          {error && (
            <div className="absolute top-4 left-4 z-[9999] p-2 bg-red-50 text-red-700 rounded shadow text-xs">Erreur: {error}</div>
          )}
          <TileLayer url={tileUrl} attribution='&copy; Local TileServer' />
          {displayedPoints.map(renderPoint)}

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