import express from "express";
import { z } from "zod";
import { db } from "../prisma/db.js";
import {
  authenticateToken,
  AuthRequest,
} from "../middleware/auth.js";

const router = express.Router();

const investmentSchema = z.object({
  planId: z.number().int().positive(),
});

router.post("/", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const result = investmentSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        message: "Invalid investment details",
        errors: result.error.issues,
      });
    }

    const { planId } = result.data;

    const investmentPlanModel = db.orm?.public?.InvestmentPlan;

    if (!investmentPlanModel) {
      return res.status(500).json({
        message: "Investment plan model unavailable",
      });
    }

    const plan = await investmentPlanModel.where({ id: planId }).first();

    if (!plan) {
      return res.status(404).json({
        message: "Investment plan not found",
      });
    }

    const investmentModel = db.orm?.public?.Investment;

    if (!investmentModel) {
      return res.status(500).json({
        message: "Investment model unavailable",
      });
    }

    const investment = await investmentModel.create({
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

router.get("/", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const investmentModel = db.orm?.public?.Investment;

    if (!investmentModel) {
      return res.status(500).json({
        message: "Investment model unavailable",
      });
    }

    const investments = await investmentModel
      .where({ userId: req.userId })
      .all();

    return res.status(200).json({
      investments,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
});

export default router;
