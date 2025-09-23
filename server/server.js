// // server.js
// import express from "express";
// import dotenv from "dotenv";
// import cors from "cors";
// import cookieParser from "cookie-parser";

// import axios from "axios";
// import authRouter from "./routes/auth.js";
// import feedbackRouter from "./routes/feedback.js";
// import formsRouter from "./routes/forms.js";
// import usersRouter from "./routes/user.js";
// import geoRoutes from "./routes/geo.js";

// dotenv.config();

// const app = express();

// app.use(express.json());
// app.use(cookieParser());

// // DEBUG: log each incoming request (temporary) — put this immediately after express.json()
// app.use((req, res, next) => {
//   try {
//     console.log("➡️ INCOMING", {
//       method: req.method,
//       path: req.path,
//       headers: {
//         origin: req.headers?.origin,
//         host: req.headers?.host,
//         "content-type": req.headers?.["content-type"],
//       },
//       body: req.body,
//     });
//   } catch (e) {
//     console.warn("⚠️ request logger failed:", e && (e.stack || e));
//   }
//   next();
// });

// app.use(
//   cors({
//     origin: ["http://localhost:3000", "http://localhost:5173"],
//     credentials: true,
//     methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//     allowedHeaders: ["Content-Type", "Authorization"],
//   })
// );

// // Optional diagnostic middleware (keep while debugging, remove in production)
// app.use((req, res, next) => {
//   try {
//     console.log("req.constructor.name", req?.constructor?.name);
//     console.log("typeof req.on", typeof (req?.on));
//     console.log("res.constructor.name", res?.constructor?.name);
//     console.log("typeof res.on", typeof (res?.on));
//   } catch (e) {
//     // ignore logging errors
//   }
//   next();
// });

// app.get("/", (req, res) => res.json({ ok: "OK👍" }));
// app.post("/check", (req, res) => res.json({ POST: "OK 🍃🍃" }));

// app.use("/api/auth", authRouter);
// app.use("/api/feedback", feedbackRouter);
// app.use("/api/forms", formsRouter);
// app.use("/api/users", usersRouter);
// app.use("/api/geo", geoRoutes);

// // DEBUG: global error handler (temporary) — must be after all routes
// app.use((err, req, res, next) => {
//   try {
//     console.error("🔥 Unhandled error:", err && (err.stack || err));
//   } catch (e) {
//     console.error("🔥 Error while logging error:", e && (e.stack || e));
//   }
//   // return stack in body for debugging; remove this in production
//   res.status(500).json({ error: String(err && (err.stack || err)) });
// });

// export default app;
// temp_server.js
import express from "express";

const app = express();

// A simple, reliable root route that does not depend on anything
app.get("/", (req, res) => {
    console.log("✅ Root route was reached!");
    res.status(200).json({ status: "OK", message: "Express is running!" });
});

// Make sure you do not have a .listen() call here!

export default app;