import React, { useState, useEffect } from 'react';
import L from 'leaflet';
import {
  MapContainer,
  TileLayer,
  Marker,
  Tooltip
} from 'react-leaflet';

import 'leaflet/dist/leaflet.css';
import { backendURL } from '../constant';
import { formatDate, formatNumber } from '../utils';

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
  stateProgress?: number | null;
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
  const [selectedShapes, setSelectedShapes] = useState<PointType[]>(['all']);
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

  const renderPoint = (point: MapPoint) => {
    const progress = point.backendData.stateProgress ? Math.round(point.backendData.stateProgress * 100) : 0;
    let progressColor = '#ef4444';
    if (progress > 66) progressColor = '#22c55e';
    else if (progress > 33) progressColor = '#f97316';

    let icon;
    if (point.type === 'circle') icon = createIcon('#3b82f6', 'circle');
    else if (point.type === 'square') icon = createIcon('#f97316', 'square');
    else icon = createIcon('#ef4444', 'triangle');

    return (
      <Marker key={point.id} position={[point.lat, point.lng]} icon={icon}>
        <Tooltip direction="top" offset={[0, -10]} opacity={1} permanent={false}>
          <div className="bg-white p-4 rounded-lg shadow-xl border border-slate-200 text-sm text-slate-700 max-w-[320px] relative">
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white"></div>
            <div className="font-bold text-lg mb-4 text-slate-900 border-b-2 border-slate-200 text-center">Point #{point.id}</div>
            <div className="mb-3">
              <div className="text-xs font-medium mb-1 text-center text-slate-600">Progression: <span className="font-bold text-slate-800">{progress}%</span></div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="h-2 rounded-full" style={{width: `${progress}%`, backgroundColor: progressColor}}></div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  <span className="font-medium">Date de signalement:</span>
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
                <span className="ml-5 text-right">{point.backendData.surface ? formatNumber(point.backendData.surface) : '-'} m²</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></svg>
                  <span className="font-medium">Budget:</span>
                </div>
                <span className="ml-5 text-right">{point.backendData.budget ? formatNumber(point.backendData.budget) : '-'} Ar</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                  <span className="font-medium">Usine(s):</span>
                </div>
                <span className="ml-5 text-right truncate max-w-[120px]">{point.backendData.factoryLabels ?? '-'}</span>
              </div>
            </div>
          </div>
        </Tooltip>
      </Marker>
    );
  };

  const IconFilter = () => <svg className="w-6 h-6 text-slate-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>;

  // compute displayed points based on selectedShapes ('all' shows everything, else filter to selected types)
  const displayedPoints = selectedShapes.includes('all') ? allPoints : allPoints.filter(p => selectedShapes.includes(p.type));

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
                className="bg-white/95 backdrop-blur-sm p-5 rounded-xl shadow-2xl border-2 border-slate-200/60 pointer-events-auto transition-all duration-300 transform origin-top-right w-64"
              >
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-semibold text-sm uppercase tracking-wide text-slate-800">Filtre</h4>
                  <button 
                    type="button" 
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 active:bg-slate-300 transition-all duration-200 hover:scale-105 shadow-lg border border-slate-300"
                    onClick={(e) => { e.stopPropagation(); setIsLegendOpen(false); }}
                    aria-label="Fermer"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-slate-600">
                      <path d="M6 6l12 12" />
                      <path d="M18 6L6 18" />
                    </svg>
                  </button>
                </div>
                <div className="flex flex-col gap-3">
                  <button
                    type="button"
                    className={`flex items-center gap-3 p-4 bg-white border-2 rounded-xl text-left cursor-pointer transition-all duration-200 hover:shadow-lg active:scale-[0.98] ${selectedShapes.includes('all') ? 'border-slate-500 bg-slate-100 shadow-xl ring-2 ring-slate-300' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 hover:shadow-md'}`}
                    onClick={(e) => { e.stopPropagation(); setSelectedShapes(['all']); }}
                  >
                    <span className={`w-6 h-6 rounded-md flex items-center justify-center transition-all ${selectedShapes.includes('all') ? 'bg-slate-600 border-slate-600' : 'bg-slate-200 border-slate-400'}`}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={`w-4 h-4 ${selectedShapes.includes('all') ? 'text-white' : 'text-slate-600'}`}>
                        <path d="M5 12l5 5L20 7" />
                      </svg>
                    </span>
                    <div>
                      <div className={`font-semibold text-sm transition-colors ${selectedShapes.includes('all') ? 'text-slate-900' : 'text-slate-700'}`}>Tous</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    className={`flex items-center gap-3 p-4 bg-white border-2 rounded-xl text-left cursor-pointer transition-all duration-200 hover:shadow-lg active:scale-[0.98] ${selectedShapes.includes('circle') ? 'border-blue-500 bg-blue-50 shadow-xl ring-2 ring-blue-200' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 hover:shadow-md'}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedShapes(prev => {
                        if (prev.includes('circle')) {
                          const newShapes = prev.filter(s => s !== 'circle');
                          return newShapes.length === 0 ? ['all'] : newShapes;
                        } else {
                          return [...prev.filter(s => s !== 'all'), 'circle'];
                        }
                      });
                    }}
                  >
                    <span className="w-6 h-6 bg-blue-500 rounded-full shadow-sm"></span>
                    <div>
                      <div className={`font-semibold text-sm transition-colors ${selectedShapes.includes('circle') ? 'text-slate-900' : 'text-slate-700'}`}>Peu grave</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    className={`flex items-center gap-3 p-4 bg-white border-2 rounded-xl text-left cursor-pointer transition-all duration-200 hover:shadow-lg active:scale-[0.98] ${selectedShapes.includes('square') ? 'border-orange-500 bg-orange-50 shadow-xl ring-2 ring-orange-200' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 hover:shadow-md'}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedShapes(prev => {
                        if (prev.includes('square')) {
                          const newShapes = prev.filter(s => s !== 'square');
                          return newShapes.length === 0 ? ['all'] : newShapes;
                        } else {
                          return [...prev.filter(s => s !== 'all'), 'square'];
                        }
                      });
                    }}
                  >
                    <span className="w-6 h-6 bg-orange-500 rounded-md shadow-sm"></span>
                    <div>
                      <div className={`font-semibold text-sm transition-colors ${selectedShapes.includes('square') ? 'text-slate-900' : 'text-slate-700'}`}>Grave</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    className={`flex items-center gap-3 p-4 bg-white border-2 rounded-xl text-left cursor-pointer transition-all duration-200 hover:shadow-lg active:scale-[0.98] ${selectedShapes.includes('triangle') ? 'border-red-500 bg-red-50 shadow-xl ring-2 ring-red-200' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 hover:shadow-md'}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedShapes(prev => {
                        if (prev.includes('triangle')) {
                          const newShapes = prev.filter(s => s !== 'triangle');
                          return newShapes.length === 0 ? ['all'] : newShapes;
                        } else {
                          return [...prev.filter(s => s !== 'all'), 'triangle'];
                        }
                      });
                    }}
                  >
                    <span className="w-6 h-6 bg-red-500 shadow-sm" style={{clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)'}}></span>
                    <div>
                      <div className={`font-semibold text-sm transition-colors ${selectedShapes.includes('triangle') ? 'text-slate-900' : 'text-slate-700'}`}>Très grave</div>
                    </div>
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