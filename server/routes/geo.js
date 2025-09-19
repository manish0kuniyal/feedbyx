// routes/geo.js
import express from "express";
import axios from "axios";
import rateLimit from "express-rate-limit";

const router = express.Router();

const geoLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: "Too many geo requests, slow down."
});

// normalize helper (same rule as client)
const normalizeIp = (ip) => {
  if (!ip) return ip;
  const trimmed = ip.toString().trim();
  if (trimmed.startsWith("::ffff:")) return trimmed.replace(/^::ffff:/i, "");
  return trimmed;
};

router.post("/bulk", geoLimiter, async (req, res) => {
  try {
    const ips = Array.isArray(req.body?.ips) ? req.body.ips : [];
    if (ips.length === 0) {
      return res.status(400).json({ ok: false, error: "Provide array of ips" });
    }

    // Normalize and dedupe
    const normalized = Array.from(new Set(ips.map(normalizeIp).filter(Boolean)));
    console.log("geo.bulk called with normalized ips:", normalized);

    // Prepare batch payload for ip-api (they expect query fields)
    const batchPayload = normalized.map(ip => ({ query: ip }));

    const resp = await axios.post(
      "http://ip-api.com/batch?fields=status,message,query,city,regionName,country",
      batchPayload,
      { timeout: 10000 }
    );

    const results = resp.data.map(r => {
      // ip-api returns r.query as the IP it looked up
      const ipKey = normalizeIp(r.query);
      if (r.status !== "success") {
        return { ip: ipKey, city: null, region: null, country: null, label: "Unknown", status: r.status, message: r.message || null };
      }
      const parts = [r.city, r.regionName, r.country].filter(Boolean);
      return {
        ip: ipKey,
        city: r.city || null,
        region: r.regionName || null,
        country: r.country || null,
        label: parts.length ? parts.join(", ") : "Unknown",
        status: "success"
      };
    });

    // Build map keyed by normalized ip
    const map = {};
    results.forEach(r => { map[r.ip] = r; });

    console.log("geo.bulk map keys:", Object.keys(map));
    return res.json({ ok: true, map });
  } catch (err) {
    console.error("geo bulk error", err?.message || err);
    return res.status(500).json({ ok: false, error: "Geo lookup failed" });
  }
});



export default router;
