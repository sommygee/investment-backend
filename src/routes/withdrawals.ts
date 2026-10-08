import express from "express";
import { db } from "../prisma/db.js";
import {
  authenticateToken,
  AuthRequest,
} from "../middleware/auth.js";

const router = express.Router();

router.post("/", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        message: "Valid withdrawal amount is required",
      });
    }

    const withdrawalModel = db?.orm?.public?.Withdrawal;

    if (!withdrawalModel) {
      return res.status(500).json({
        message: "Database unavailable",
      });
    }

    const withdrawal = await withdrawalModel.create({
      userId: req.userId!,
      amount,
      status: "pending",
    });

    return res.status(201).json({
      message: "Withdrawal request submitted successfully",
      withdrawal,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
});

export default router;