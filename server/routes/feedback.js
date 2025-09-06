import express from "express";
import Feedback from "../models/Feedback.js";
import Form from "../models/Form.js";

const router = express.Router();

// Save feedback
router.post("/", async (req, res) => {
  const { formId,formName, responses } = req.body;

  if ( !formName || !formId || !responses) {
    return res.status(400).json({ success: false, error: "formId and responses are required" });
  }

  const newFeedback = await Feedback.create({ formId, formName,responses });

  return res.status(201).json({ success: true, data: newFeedback });
});

// Get feedbacks
router.get("/", async (req, res) => {
  const { uid, query } = req.query;

  let feedbacks = [];

  if (uid) {
    const userForms = await Form.find({ userId: uid }).lean();
    const formIds = userForms.map((f) => f.customId);
    feedbacks = await Feedback.find({ formId: { $in: formIds } }).lean();
  } else if (query) {
    feedbacks = await Feedback.find({
      $or: [
        { "responses.name": { $regex: new RegExp(query, "i") } },
        { "responses.email": { $regex: new RegExp(query, "i") } },
      ],
    }).lean();
  } else {
    return res.json({ feedbacksByForm: {} });
  }

  const feedbacksByForm = {};
  feedbacks.forEach((fb) => {
    const id = fb.formId.toString();
    if (!feedbacksByForm[id]) feedbacksByForm[id] = [];
    feedbacksByForm[id].push(fb);
  });

  return res.json({ success: true, feedbacksByForm });
});

export default router;
