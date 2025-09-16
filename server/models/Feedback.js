import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema({
  formId: { type: String, required: true },
  formName: { type: String, required: true },

  // answers
  responses: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    required: true,
  },

  // extra info we collect from frontend
  metadata: {
    utm: { type: Map, of: String, default: {} }, // all utm_* params
    referrer: { type: String, default: "" },     // document.referrer
    pageUrl: { type: String, default: "" },      // window.location.href
    userAgent: { type: String, default: "" },    // navigator.userAgent
    location: {
      lat: { type: Number },
      lng: { type: Number },
      accuracy: { type: Number },
    },
  },

  clientIp: { type: String, default: "" }, // filled server-side
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Feedback ||
  mongoose.model("Feedback", feedbackSchema);
