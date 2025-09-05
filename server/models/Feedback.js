import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema({
  formId: {
    type: String,
    required: true,
  },
  responses: {
    type: Map,
    of: mongoose.Schema.Types.Mixed, // can hold strings, numbers, etc.
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Feedback ||
  mongoose.model("Feedback", feedbackSchema);
