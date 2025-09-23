// src/hooks/useResolveIpsByIps.js
import { useEffect, useState } from "react";

// Normalize ip: strip IPv4-mapped IPv6 ::ffff: prefix and whitespace
const normalizeIp = (ip) => {
  if (!ip) return ip;
  const trimmed = ip.trim();
  if (trimmed.startsWith("::ffff:")) return trimmed.replace(/^::ffff:/i, "");
  return trimmed;
};

// naive private/local check (expand if needed)
const isPrivateOrLocalIp = (ip) => {
  if (!ip) return true;
  if (ip === "::1" || ip === "127.0.0.1") return true;
  // IPv4 ranges (naive)
  if (ip.startsWith("10.") || ip.startsWith("192.168.") || ip.startsWith("172.")) return true;
  // also consider localhost loopback mapped forms
  if (ip === "0:0:0:0:0:0:0:1") return true;
  return false;
};

export function useResolveIpsByIps(ips = []) {
  const [geoMap, setGeoMap] = useState({});
  const [loading, setLoading] = useState(false);

  // normalize and unique ips
  const normalized = Array.from(new Set((ips || []).map(normalizeIp).filter(Boolean)));
  const ipsKey = normalized.length ? normalized.join(",") : "";

  useEffect(() => {
    if (!ipsKey) return;

    // partition: local vs public
    const localMap = {};
    const toFetch = [];
    for (const ip of normalized) {
      if (isPrivateOrLocalIp(ip)) {
        localMap[ip] = { ip, city: null, region: null, country: null, label: "Localhost" };
      } else {
        toFetch.push(ip);
      }
    }

    if (toFetch.length === 0) {
      setGeoMap(prev => ({ ...prev, ...localMap }));
      return;
    }

    let cancelled = false;
    setLoading(true);

    (async () => {
      try {
        console.debug("geo: resolving ips", toFetch);
        const res = await fetch("http://localhost:5000/api/geo/bulk", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ips: toFetch }),
        });

        if (!res.ok) {
          const txt = await res.text().catch(() => "");
          throw new Error(`geo bulk failed ${res.status} ${txt}`);
        }

        const data = await res.json();
        console.debug("geo: response", data);

        // data.map should be keyed by normalized IPs (server will also normalize)
        const fetchedMap = data?.map || {};

        const merged = { ...localMap, ...fetchedMap };
        if (!cancelled) setGeoMap(prev => ({ ...prev, ...merged }));
      } catch (err) {
        console.warn("useResolveIpsByIps: fetch failed", err);
        if (!cancelled) setGeoMap(prev => ({ ...prev, ...localMap }));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [ipsKey]); // stable dependency

  return { geoMap, loading };
}
