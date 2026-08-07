import React, { useEffect, useRef, useState } from 'react';
import { MapPin } from 'lucide-react';

/* global L */

const DEFAULT_CENTER = [5.569361, 95.355377]; // Solace Coffee (Lamgugob)
const DEFAULT_ZOOM = 13;

export default function LocationPicker({ value, onChange, onCoordinatesChange }) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [currentCoords, setCurrentCoords] = useState(null);

  // Fix Leaflet default marker icon path (CDN issue)
  useEffect(() => {
    if (window.L) {
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });
    }
  }, []);

  // Init map
  useEffect(() => {
    if (!window.L || !mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      zoomControl: false,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    // Center pin logic
    map.on('moveend', () => {
      const center = map.getCenter();
      reverseGeocode(center.lat, center.lng);
    });

    mapRef.current = map;

    // Try to get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (mapRef.current) {
            const latlng = [pos.coords.latitude, pos.coords.longitude];
            mapRef.current.setView(latlng, 16);
          }
        },
        () => {}, // silently fail
        { timeout: 5000 }
      );
    }

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  const reverseGeocode = async (lat, lng) => {
    setCurrentCoords({ lat, lng });
    if (onCoordinatesChange) onCoordinatesChange({ lat, lng });
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=id`,
        { headers: { 'Accept-Language': 'id' } }
      );
      const data = await res.json();
      if (data.display_name) {
        onChange(data.display_name);
      } else {
        onChange(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
      }
    } catch {
      onChange(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    }
  };

  const searchLocation = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    setShowResults(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=8&addressdetails=1&countrycodes=id&accept-language=id`,
        { headers: { 'Accept-Language': 'id', 'User-Agent': 'SolaceCoffeeApp/1.0' } }
      );
      const data = await res.json();
      setSearchResults(data);
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const selectResult = (result) => {
    const latlng = { lat: parseFloat(result.lat), lng: parseFloat(result.lon) };
    if (mapRef.current) {
      mapRef.current.setView(latlng, 17);
    }
    setCurrentCoords(latlng);
    if (onCoordinatesChange) onCoordinatesChange(latlng);
    onChange(result.display_name);
    setShowResults(false);
    setSearchQuery('');
  };

  return (
    <div style={styles.wrapper}>
      {/* Search bar + results: outside map container to avoid overflow clipping */}
      <div style={styles.searchWrap}>
        <input
          type="text"
          placeholder="Cari lokasi... (contoh: Gampong Jawa, Banda Aceh)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && searchLocation()}
          style={styles.searchInput}
        />
        <button onClick={searchLocation} style={styles.searchBtn} disabled={searching}>
          {searching ? '⏳' : '🔍'}
        </button>
      </div>

      {/* Search results dropdown */}
      {showResults && searchResults.length > 0 && (
        <div style={styles.resultsDropdown}>
          {searchResults.map((r, i) => (
            <button
              key={i}
              style={styles.resultItem}
              onClick={() => selectResult(r)}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--light-tan)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'white')}
            >
              <span style={styles.resultIcon}>📍</span>
              <span style={styles.resultText}>{r.display_name}</span>
            </button>
          ))}
        </div>
      )}
      {showResults && !searching && searchResults.length === 0 && searchQuery && (
        <div style={styles.resultsDropdown}>
          <div style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: 13 }}>
            Lokasi tidak ditemukan. Coba tambahkan nama kota (misal: Desa Xyz, Banda Aceh).
          </div>
        </div>
      )}

      {/* Map Container */}
      <div style={styles.container}>
        <div style={{ position: 'relative' }}>
          <div ref={mapContainerRef} style={styles.map} />
          {/* Fixed Center Pin */}
          <div style={styles.centerPin}>
            <MapPin size={40} color="var(--dark-red)" style={{ marginTop: -40, fill: 'var(--dark-red)', filter: 'drop-shadow(0px 4px 4px rgba(0,0,0,0.3))' }} />
          </div>
        </div>

        {/* Hint */}
        <p style={styles.hint}>📌 Geser peta untuk menetapkan titik lokasi pengiriman</p>

        {/* Selected address display */}
        {value && (
          <div style={styles.selectedAddr}>
            <span style={{ marginRight: 6 }}>📍</span>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span>{value}</span>
              {currentCoords && (
                <span style={{ fontSize: 11, color: '#1a73e8', marginTop: 2, fontWeight: 600 }}>
                  {currentCoords.lat.toFixed(6)}, {currentCoords.lng.toFixed(6)}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    position: 'relative',
  },
  container: {
    borderRadius: 12,
    overflow: 'hidden',
    border: '1.5px solid var(--border)',
    marginTop: 8,
  },
  searchWrap: {
    display: 'flex',
    gap: 0,
    position: 'relative',
    zIndex: 10,
  },
  searchInput: {
    flex: 1,
    padding: '10px 14px',
    border: 'none',
    borderRadius: '8px 0 0 8px',
    fontSize: 13,
    fontFamily: "'DM Sans', sans-serif",
    outline: 'none',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    background: 'white',
  },
  searchBtn: {
    padding: '10px 14px',
    border: 'none',
    borderRadius: '0 8px 8px 0',
    background: 'var(--dark-red)',
    color: 'white',
    fontSize: 16,
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
  },
  resultsDropdown: {
    position: 'absolute',
    top: 48,
    left: 0,
    right: 0,
    zIndex: 1000,
    background: 'white',
    borderRadius: 8,
    boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
    maxHeight: 220,
    overflowY: 'auto',
    border: '1px solid var(--border)',
  },
  resultItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 8,
    width: '100%',
    padding: '10px 14px',
    border: 'none',
    borderBottom: '1px solid #f0e8dc',
    background: 'white',
    cursor: 'pointer',
    textAlign: 'left',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 13,
    transition: 'background 0.15s',
  },
  resultIcon: { fontSize: 14, flexShrink: 0, marginTop: 1 },
  resultText: { color: 'var(--text-dark)', lineHeight: 1.4 },
  map: {
    width: '100%',
    height: 260,
    cursor: 'crosshair',
  },
  hint: {
    padding: '8px 12px',
    fontSize: 11,
    color: 'var(--text-muted)',
    background: 'var(--card-bg)',
    margin: 0,
    textAlign: 'center',
  },
  selectedAddr: {
    display: 'flex',
    alignItems: 'flex-start',
    padding: '10px 14px',
    fontSize: 12,
    color: 'var(--text-dark)',
    background: 'rgba(255,255,255,0.7)',
    borderTop: '1px solid var(--border)',
    lineHeight: 1.4,
  },
  centerPin: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: 1000,
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
};
