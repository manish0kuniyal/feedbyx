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


  app.listen(5000, () => console.log("Server running on http://localhost:5000"));
