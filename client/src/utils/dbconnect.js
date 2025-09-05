import { ConnectDB } from "../db/Connectdb.js";
import mongoose from "mongoose";
// app/utils/withDB.js
export function withDB(handler) {
  return async (req, context) => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
    }
    return handler(req, context); // ✅ forward context so params isn’t lost
  };
}

