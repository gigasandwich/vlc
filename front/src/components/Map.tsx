import React, { useEffect } from 'react';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

// --- 1. IMPORT CSS OBLIGATOIRE ---
import 'leaflet/dist/leaflet.css';
// -------------------------------

import markerIconUrl from "leaflet/dist/images/marker-icon.png";
import markerRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import markerShadowUrl from "leaflet/dist/images/marker-shadow.png";

// --- 2. CONFIGURATION DES STYLES (CSS) ---
// Cela rend l'interface plus propre et moderne
const styles = {
  appContainer: {
    height: '100vh', // Prend toute la hauteur de la fenêtre
    width: '100vw',
    display: 'flex',
    flexDirection: 'column' as 'column', // Colonne : Header -> Map -> Footer
    overflow: 'hidden', // Empêche le scroll global
    backgroundColor: '#f4f4f4',
    fontFamily: 'Arial, sans-serif',
  },
  header: {
    padding: '15px 20px',
    backgroundColor: '#ffffff',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  mapWrapper: {
    flex: 1, // La map prendra tout l'espace RESTANT (entre header et footer)
    position: 'relative' as 'relative',
    backgroundColor: '#ddd', // Fond de chargement gris
  },
  footer: {
    padding: '15px 20px',
    backgroundColor: '#333',
    color: '#fff',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '0.9rem',
    zIndex: 1000,
  },
};

// --- 3. CONFIGURATION DES ICÔNES ---
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
  
  // URL de tes tuiles (Assure-toi que le style existe sur http://localhost:8081)
  const tileUrl = "http://localhost:8081/styles/basic-preview/{z}/{x}/{y}.png";

  return (
    <div style={styles.appContainer}>
      
      {/* HEADER */}
      <header style={styles.header}>
        <h2 style={{ margin: 0, color: '#333' }} className='bg-red-300'>Antananarivo Map</h2>
        <span style={{ color: '#666', fontSize: '0.9rem' }}>Mode Offline</span>
      </header>

      {/* CONTENEUR DE LA CARTE (Il grandit/rétrécit automatiquement) */}
      <main style={styles.mapWrapper}>
        <MapContainer 
          center={tanaPosition} 
          zoom={13} 
          style={{ height: '100%', width: '100%' }} // Important pour remplir le parent
          zoomControl={true} // Les boutons + / -
          scrollWheelZoom={true}
        >
          <TileLayer
            url={tileUrl}
            attribution='&copy; Local TileServer'
          />
          <Marker position={tanaPosition}>
            <Popup>
              <b>Analakely</b><br />
              Serveur Docker actif.
            </Popup>
          </Marker>
        </MapContainer>
      </main>

      {/* BOTTOM BAR (FOOTER) */}
      <footer style={styles.footer}>
        <div>
          <strong>Statut :</strong> Connecté au serveur Localhost:8081
        </div>
        <div>
          {/* Petit bouton d'action exemple */}
          <button style={{
            padding: '5px 10px', 
            cursor: 'pointer', 
            background: '#555', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px'
          }}>
            Centrer la carte
          </button>
        </div>
      </footer>

    </div>
  );
};

export default MapPage;