'use client';

import React, { useMemo, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

/* fix leaflet marker icons for most bundlers */
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
 * FitBounds helper - calls map.fitBounds when points change
 */
function FitBounds({ points }) {
  const map = useMap();

  useEffect(() => {
    if (!map || !points || points.length === 0) return;

    // build LatLngs
    const latLngs = points.map(p => [p.lat, p.lng]);
    try {
      const bounds = L.latLngBounds(latLngs);
      map.fitBounds(bounds, { padding: [40, 40] });
    } catch (err) {
      // fallback: center on first point
      map.setView([points[0].lat, points[0].lng], 2);
      console.warn('FitBounds failed, falling back to center:', err);
    }
  }, [map, points]);

  return null;
}

/**
 * FeedbackMap
 * - feedbacks: array of feedback objects (various metadata shapes handled)
 * - height: CSS height (string)
 */
export default function FeedbackMap({ feedbacks = [], height = '300px' }) {
  // Normalize coordinate extraction to many possible shapes
  // and coerce to Number. Log invalid entries (helps debug prod).
  const points = useMemo(() => {
    if (!Array.isArray(feedbacks)) return [];

    const seen = new Set();
    const out = [];

    feedbacks.forEach((f, i) => {
      const meta = f?.metadata || {};
      // common possible fields in your project:
      // meta.location, meta.locationGeo, meta.ipGeo, meta.locationLabel, meta.ipGeo?.lat/lng
      const candidates = [
        // nested location object with lat/lng
        meta.location,
        // geo object
        meta.locationGeo,
        // ip geolocation fallback
        meta.ipGeo,
        // sometimes top-level coords
        f?.location,
        f?.locationGeo,
        f?.ipGeo,
      ].filter(Boolean);

      let lat, lng;
      for (const c of candidates) {
        // support both (lat,lng) and (latitude,longitude)
        const possibleLat = c.lat ?? c.latitude ?? c.latValue ?? c.latLng?.lat;
        const possibleLng = c.lng ?? c.longitude ?? c.lngValue ?? c.latLng?.lng;
        if (possibleLat != null && possibleLng != null) {
          lat = Number(possibleLat);
          lng = Number(possibleLng);
          break;
        }
      }

      // final fallback: maybe metadata stored as strings under other keys
      if ((lat == null || lng == null) && meta.locationLabel && meta.locationLabelCoords) {
        // e.g. "12.34,56.78" style — try parse
        const match = String(meta.locationLabelCoords).match(/(-?\d+(?:\.\d+)?)[, ]+(-?\d+(?:\.\d+)?)/);
        if (match) {
          lat = Number(match[1]);
          lng = Number(match[2]);
        }
      }

      const isValid = typeof lat === 'number' && typeof lng === 'number' && !Number.isNaN(lat) && !Number.isNaN(lng);
      if (!isValid) {
        // log minimal info - helpful to inspect production console
        // remove or gate logs if noisy in prod
        // eslint-disable-next-line no-console
        console.warn(`FeedbackMap: invalid coords for item ${i}`, {
          idx: i,
          id: f?.id || f?.customId,
          metaSample: {
            location: meta.location,
            locationGeo: meta.locationGeo,
            ipGeo: meta.ipGeo,
          },
        });
        return; // skip this entry
      }

      // dedupe by lat,lng (helps if many items share exact coords)
      const key = `${lat.toFixed(6)}:${lng.toFixed(6)}`;
      // allow duplicates but combine metadata counts by counting occurrences
      if (!seen.has(key)) {
        seen.add(key);
        out.push({
          lat,
          lng,
          label: meta.locationGeo?.label || meta.locationLabel || meta.ipGeo?.label || f?.responses?.name || 'Unknown',
          meta: f,
          count: 1,
        });
      } else {
        // increment count for existing point
        const existing = out.find(o => `${o.lat.toFixed(6)}:${o.lng.toFixed(6)}` === key);
        if (existing) existing.count = (existing.count || 1) + 1;
      }
    });

    return out;
  }, [feedbacks]);

  // center fallback (world)
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
        whenCreated={(map) => {
          // ensure tiles load properly (debug helper)
          // eslint-disable-next-line no-console
          console.debug('FeedbackMap: map created', { center, zoom, pointsCount: points.length });
        }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Fit bounds to show all markers */}
        <FitBounds points={points} />

        {points.map((p, i) => {
          // unique key: label + coords + i
          const key = `${p.label}-${p.lat}-${p.lng}-${i}`;
          return (
            <Marker key={key} position={[p.lat, p.lng]}>
              <Popup>
                <div style={{ maxWidth: 300 }}>
                  <strong>{p.label}</strong>
                  <div className="text-xs mt-1">
                    {p.meta?.responses?.formName && <div>Form: {p.meta.responses.formName}</div>}
                    {p.meta?.responses?.email && <div>Email: {p.meta.responses.email}</div>}
                    {p.meta?.responses?.rating != null && <div>Rating: {p.meta.responses.rating}</div>}
                    {p.count > 1 && <div className="text-xs opacity-70 mt-1">Count: {p.count}</div>}
                    {p.meta?.metadata?.pageUrl && (
                      <div className="text-xs opacity-70 mt-1">
                        <a href={p.meta.metadata.pageUrl} target="_blank" rel="noreferrer">{p.meta.metadata.pageUrl}</a>
                      </div>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
