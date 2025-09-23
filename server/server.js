// server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";

import axios from "axios";
import authRouter from "./routes/auth.js";
import feedbackRouter from "./routes/feedback.js";
import formsRouter from "./routes/forms.js";
import usersRouter from "./routes/user.js";
import geoRoutes from "./routes/geo.js";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:5173"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Optional diagnostic middleware (keep while debugging, remove in production)
app.use((req, res, next) => {
  try {
    console.log("req.constructor.name", req?.constructor?.name);
    console.log("typeof req.on", typeof (req?.on));
    console.log("res.constructor.name", res?.constructor?.name);
    console.log("typeof res.on", typeof (res?.on));
  } catch (e) {
    // ignore logging errors
  }
  next();
});

app.get("/", (req, res) => res.json({ ok: "OK" }));
app.post("/check", (req, res) => res.json({ POST: "OK" }));

app.use("/api/auth", authRouter);
app.use("/api/feedback", feedbackRouter);
app.use("/api/forms", formsRouter);
app.use("/api/users", usersRouter);
app.use("/api/geo", geoRoutes);
app.use((err, req, res, next) => {
  console.error("🔥 Unhandled error:", err && (err.stack || err));
  res.status(500).json({ error: String(err && (err.stack || err)) });
});

export default app;
