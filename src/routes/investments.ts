import express from "express";
import { db } from "../prisma/db.js";
import {
  authenticateToken,
  AuthRequest,
} from "../middleware/auth.js";

const router = express.Router();

router.post("/", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { planId } = req.body;

    if (!planId) {
      return res.status(400).json({
        message: "Plan ID is required",
      });
    }

    const plan = await db.orm.public.InvestmentPlan
      .where({ id: planId })
      .first();

    if (!plan) {
      return res.status(404).json({
        message: "Investment plan not found",
      });
    }

    const investment = await db.orm.public.Investment.create({
      userId: req.userId!,
      planId: plan.id,
      amount: plan.amount,
      return: plan.return,
      duration: plan.duration,
      status: "active",
    });

    return res.status(201).json({
      message: "Investment created successfully",
      investment,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
});

export default router;