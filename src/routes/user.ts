import express from "express";
import { db } from "../prisma/db.js";
import {
  authenticateToken,
  AuthRequest,
} from "../middleware/auth.js";

const router = express.Router();

router.get("/profile", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userModel = db?.orm?.public?.User;

    if (!userModel) {
      return res.status(500).json({
        message: "Database unavailable",
      });
    }

    const user = await userModel
      .where({ id: req.userId })
      .first();

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
});

export default router;