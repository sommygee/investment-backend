import express from "express";
import { z } from "zod";
import { db } from "../prisma/db.js";
import {
  authenticateToken,
  AuthRequest,
} from "../middleware/auth.js";

const router = express.Router();

const withdrawalSchema = z.object({
  amount: z.number().positive(),
});

router.post("/", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const result = withdrawalSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        message: "Invalid withdrawal details",
        errors: result.error.issues,
      });
    }

    const { amount } = result.data;

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

