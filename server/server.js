import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";

import axios from "axios"; // make sure this is at the top of server.js
import authRouter from "./routes/auth.js";
import feedbackRouter from "./routes/feedback.js";
import formsRouter from "./routes/forms.js";
// import usersRouter from "./routes/users.js";
import { connectDB } from "./utils/dbconnect.js";
import usersRouter from "./routes/user.js"
import cookieParser from "cookie-parser";
import geoRoutes from './routes/geo.js';
dotenv.config();
const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:5173"], // add both if needed
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
)


await connectDB();

app.get("/",(req,res)=>{
  return res.json({"ok":"OK"})
})
app.use("/api/auth", authRouter);
app.use("/api/feedback", feedbackRouter);
app.use("/api/forms", formsRouter);
app.use("/api/users", usersRouter);
app.use('/api/geo', geoRoutes);
// DB connect
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("DB error:", err));

// --- POST /ip-location (accept IP or coordinates) ---

// tiny helper for reverse geocoding lat/lng
async function reverseGeocodeLatLng(lat, lng) {
  try {
    const resp = await axios.get("https://nominatim.openstreetmap.org/reverse", {
      params: {
        format: "jsonv2",
        lat,
        lon: lng,
        zoom: 10,
        addressdetails: 1,
        "accept-language": "en",
      },
      headers: {
        "User-Agent": process.env.NOMINATIM_UA || "feedbyx/1.0 (you@domain.com)",
      },
      timeout: 7000,
    });

    const data = resp.data;
    if (data) {
      const addr = data.address || {};
      const parts = [];
      if (addr.city) parts.push(addr.city);
      else if (addr.town) parts.push(addr.town);
      else if (addr.village) parts.push(addr.village);
      else if (addr.hamlet) parts.push(addr.hamlet);

      if (addr.state && !parts.includes(addr.state)) parts.push(addr.state);
      if (addr.country && !parts.includes(addr.country)) parts.push(addr.country);

      const label =
        parts.length ? parts.join(", ") : data.display_name || `(${lat.toFixed(4)}, ${lng.toFixed(4)})`;

      return {
        label,
        city: parts[0] || null,
        region: addr.state || null,
        country: addr.country || null,
      };
    }
  } catch (err) {
    console.warn("reverseGeocodeLatLng failed", err?.message || err);
  }
  return null;
}

app.post("/ip-location", async (req, res) => {
  try {
    let raw = req.body?.ip ?? req.query?.ip;
    if (!raw && req.body && typeof req.body === "object" && req.body.lat && req.body.lng) {
      raw = { lat: Number(req.body.lat), lng: Number(req.body.lng) };
    }

    if (!raw) {
      return res.status(400).json({ success: false, error: "missing ip or coordinates in request" });
    }

    // If raw is an object with lat/lng
    if (typeof raw === "object" && raw !== null && typeof raw.lat === "number" && typeof raw.lng === "number") {
      const lat = Number(raw.lat);
      const lng = Number(raw.lng);
      const locGeo = await reverseGeocodeLatLng(lat, lng);
      const out = {
        ip: null,
        label: locGeo?.label || `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
        city: locGeo?.city || null,
        region: locGeo?.region || null,
        country: locGeo?.country || null,
        lat,
        lon: lng,
      };
      return res.json({ success: true, locaitron: out });
    }

    // If raw is a string that looks like "lat,lng"
    if (typeof raw === "string" && raw.includes(",")) {
      const parts = raw.split(",").map((s) => s.trim()).filter(Boolean);
      if (parts.length >= 2) {
        const lat = Number(parts[0]);
        const lng = Number(parts[1]);
        if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
          const locGeo = await reverseGeocodeLatLng(lat, lng);
          const out = {
            ip: null,
            label: locGeo?.label || `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
            city: locGeo?.city || null,
            region: locGeo?.region || null,
            country: locGeo?.country || null,
            lat,
            lon: lng,
          };
          return res.json({ success: true, locaitron: out });
        }
      }
    }

    // Otherwise: fallback — you can call ip-api here if you still want IP support
    return res.json({
      success: false,
      error: "Only coordinates supported in this isolated route right now",
    });
  } catch (err) {
    console.error("ip-location error:", err);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
});


  app.listen(5000, () => console.log("Server running on http://localhost:5000"));
