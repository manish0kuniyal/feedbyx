import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";

import authRouter from "./routes/auth.js";
import feedbackRouter from "./routes/feedback.js";
import formsRouter from "./routes/forms.js";
// import usersRouter from "./routes/users.js";
import { connectDB } from "./utils/dbconnect.js";
import usersRouter from "./routes/user.js"
dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
await connectDB();
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.get("/",(req,res)=>{
  return res.json({"ok":"OK"})
})
app.use("/api/auth", authRouter);
app.use("/api/feedback", feedbackRouter);
app.use("/api/forms", formsRouter);
app.use("/api/users", usersRouter);

// DB connect
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("DB error:", err));

app.listen(5000, () => console.log("Server running on http://localhost:5000"));
