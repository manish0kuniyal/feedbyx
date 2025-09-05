import express from "express";
import { OAuth2Client } from "google-auth-library";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

const router = express.Router(); // <-- add this

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.post("/google/token", async (req, res) => {
  const { token } = req.body;
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    let user = await User.findOne({ userId: payload.sub });

    if (!user) {
      user = await User.create({
        userId: payload.sub,
        name: payload.name,
        email: payload.email,
        image: payload.picture,
        provider: "google",
      });
    }

    const jwtToken = jwt.sign({ uid: user.userId }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(401).send("Invalid Google token");
  }
});

export default router; // <-- export it
