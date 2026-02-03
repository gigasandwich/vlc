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
  point_state_label: string;
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
        <Tooltip direction="top" offset={[0, -10]} opacity={1} permanent={false}>
          <div className="bg-gradient-to-br from-white to-slate-50 p-4 rounded-xl shadow-xl border border-slate-300 text-sm text-slate-700 max-w-[320px] relative">
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white"></div>
            <div className="font-bold text-lg mb-4 text-slate-900 border-b-2 border-slate-200 pb-2 text-center">Point #{point.id}</div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  <span className="font-medium">Date:</span>
                </div>
                <span className="ml-5 text-right">{point.backendData.date ? formatDate(point.backendData.date) : '-'}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                  <span className="font-medium">État:</span>
                </div>
                <span className="ml-5 text-right">{point.backendData.stateLabel ?? '-'}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 6H3m18 0v12a2 2 0 01-2 2H5a2 2 0 01-2-2V6m18 0V4a2 2 0 00-2-2H5a2 2 0 00-2 2v2m0 0h18m-9 4v2m0 4v2m4-6v2m0 4v2" /></svg>
                  <span className="font-medium">Surface:</span>
                </div>
                <span className="ml-5 text-right">{point.backendData.surface ?? '-'} m²</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></svg>
                  <span className="font-medium">Budget:</span>
                </div>
                <span className="ml-5 text-right">{point.backendData.budget ?? '-'} Ar</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                  <span className="font-medium">Usines:</span>
                </div>
                <span className="ml-5 text-right truncate max-w-[120px]">{point.backendData.factoryLabels ?? '-'}</span>
              </div>
            </div>
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
  const IconFilter = () => <svg className="w-6 h-6 text-slate-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>;

  // compute displayed points based on selectedShape ('all' shows everything)
  const displayedPoints = selectedShape === 'all' ? allPoints : allPoints.filter(p => p.type === selectedShape);

  return (
    <div className="h-full w-full flex flex-col bg-gray-100 font-sans relative">
      
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

          {/* --- LÉGENDE RÉTRACTABLE AVEC FILTRES --- */}
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
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700">Légende & Filtres</h4>
                  <span className="text-gray-400 text-xs">✕</span>
                </div>
                <ul className="space-y-3 text-xs text-slate-700 mb-4">
                  <li className="flex items-center gap-3"><svg width="16" height="16" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" fill="#3b82f6"/></svg><span>Peu grave</span></li>
                  <li className="flex items-center gap-3"><svg width="16" height="16" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" fill="#f97316"/></svg><span>Grave</span></li>
                  <li className="flex items-center gap-3"><svg width="16" height="16" viewBox="0 0 24 24"><polygon points="12,3 21,20 3,20" fill="#ef4444"/></svg><span>Très grave</span></li>
                </ul>
                {/* Filter buttons */}
                <div className="flex gap-2 w-[250px] h-[50px] bg-slate-50 p-2 rounded-lg border border-slate-200">
                  <button onClick={() => setSelectedShape(prev => prev === 'circle' ? 'all' : 'circle')} className={getBtnClasses('circle')} title="Peu grave">
                    <IconCircle />
                  </button>
                  <button onClick={() => setSelectedShape(prev => prev === 'square' ? 'all' : 'square')} className={getBtnClasses('square')} title="Grave">
                    <IconSquare />
                  </button>
                  <button onClick={() => setSelectedShape(prev => prev === 'triangle' ? 'all' : 'triangle')} className={getBtnClasses('triangle')} title="Très grave">
                    <IconTriangle />
                  </button>
                </div>
              </div>
            )}

            {!isLegendOpen && (
              <button 
                onPointerDown={(e) => {
                  e.stopPropagation(); 
                  e.preventDefault();
                  setIsLegendOpen(true);
                }}
                className="bg-white shadow-2xl border-2 border-slate-300 pointer-events-auto hover:bg-gray-50 active:bg-gray-100 transition-all
                           w-14 h-14 rounded-full flex items-center justify-center z-[9999]"
                title="Ouvrir la légende et les filtres"
              >
                <IconFilter />
              </button>
            )}

          </div>
        </MapContainer>
      </main>
    </div>
  );
};

export default MapPage;