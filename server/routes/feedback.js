import express from "express";
import Feedback from "../models/Feedback.js";
import Form from "../models/Form.js";

const router = express.Router();

// Save feedback
router.post("/", async (req, res) => {
  try {
    const { formId, formName, responses, metadata } = req.body;

    if (!formId || !formName || !responses) {
      return res.status(400).json({ success: false, error: "formId, formName and responses are required" });
    }

    // capture client IP properly (works with proxies if trust proxy is set)
    const ip =
      (req.headers['x-forwarded-for'] || '').split(',').map(s => s.trim()).filter(Boolean)[0]
      || req.socket?.remoteAddress
      || req.ip
      || '';

    // minimal safe metadata extraction
    const safeMeta = {
      utm: metadata?.utm || {},
      referrer: metadata?.referrer || '',
      pageUrl: metadata?.pageUrl || '',
      userAgent: metadata?.userAgent || '',
      location: metadata?.location || null,
      clientTs: metadata?.clientTs ? new Date(metadata.clientTs) : undefined,
    };

    const newFeedback = await Feedback.create({
      formId,
      formName,
      responses,
      metadata: safeMeta,
      clientIp: ip,
    });

    return res.status(201).json({ success: true, data: newFeedback });
  } catch (err) {
    console.error("Feedback save error:", err);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
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
