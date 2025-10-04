'use client';

import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

/**
 * Leaflet marker icon fix for ESM environments (no `require`).
 * Using import.meta.url -> works in Vite, modern ESM bundlers, and Next client components.
 */
const markerIconUrl = new URL('leaflet/dist/images/marker-icon.png', import.meta.url).href;
const markerIcon2xUrl = new URL('leaflet/dist/images/marker-icon-2x.png', import.meta.url).href;
const markerShadowUrl = new URL('leaflet/dist/images/marker-shadow.png', import.meta.url).href;

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2xUrl,
  iconUrl: markerIconUrl,
  shadowUrl: markerShadowUrl,
});

/**
 * FeedbackMap
 *
 * Props:
 *  - feedbacks: array of feedback objects (each may have metadata.location.lat & metadata.location.lng,
 *               or metadata.ipGeo.lat & metadata.ipGeo.lng). Any other metadata will be available in popups.
 *  - height: CSS height for the map container (default: '300px')
 */
export default function FeedbackMap({ feedbacks = [], height = '300px' }) {
  // normalize points: prefer metadata.location, fallback to metadata.ipGeo
  const points = useMemo(() => {
    return (Array.isArray(feedbacks) ? feedbacks : [])
      .map((f) => {
        const meta = f?.metadata || {};
        const loc = meta.location;
        const ipg = meta.ipGeo;
        const lat = loc?.lat ?? ipg?.lat;
        const lng = loc?.lng ?? ipg?.lng;
        if (typeof lat === 'number' && typeof lng === 'number' && !Number.isNaN(lat) && !Number.isNaN(lng)) {
          return {
            lat,
            lng,
            label: meta.locationGeo?.label || meta.locationLabel || meta.ipGeo?.label || f?.responses?.name || 'Unknown',
            meta: f,
          };
        }
        return null;
      })
      .filter(Boolean);
  }, [feedbacks]);

  // sensible center: first point or world center
  const center = points.length > 0 ? [points[0].lat, points[0].lng] : [20, 0];
  const zoom = points.length > 0 ? 2 : 1;

  return (
    <div className="rounded-xl overflow-hidden border" style={{ height }}>
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
        attributionControl={false}
      >
        {/* OpenStreetMap tiles (no API key) */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {points.map((p, i) => (
          <Marker key={i} position={[p.lat, p.lng]}>
            <Popup>
              <div style={{ maxWidth: 300 }}>
                <strong>{p.label}</strong>
                <div className="text-xs mt-1">
                  {p.meta?.responses?.formName && <div>Form: {p.meta.responses.formName}</div>}
                  {p.meta?.responses?.email && <div>Email: {p.meta.responses.email}</div>}
                  {p.meta?.responses?.rating != null && <div>Rating: {p.meta.responses.rating}</div>}
                  {p.meta?.metadata?.pageUrl && (
                    <div className="text-xs opacity-70 mt-1">
                      <a href={p.meta.metadata.pageUrl} target="_blank" rel="noreferrer">{p.meta.metadata.pageUrl}</a>
                    </div>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
