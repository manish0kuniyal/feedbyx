import express from "express";
import { v4 as uuidv4 } from "uuid";
import Form from "../models/Form.js";

const router = express.Router();

// Create form
router.post("/", async (req, res) => {
  const { name, uid, fields } = req.body;

  if (!name || !uid || !fields || !Array.isArray(fields) || fields.length === 0) {
    return res.status(400).json({ error: "Name, UID, and at least one field are required." });
  }

  const formId = uuidv4();

  const newForm = await Form.create({
    name,
    customId: formId,
    userId: uid,
    fieldType: fields,
  });

  return res.json({ message: "Form created", form: newForm });
});

// Get forms by user
router.get("/", async (req, res) => {
  const { uid } = req.query;

  if (!uid) return res.json({ forms: [] });

  const allForms = await Form.find({ userId: uid });
  return res.json({ forms: allForms });
});

export default router;
