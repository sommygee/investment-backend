import express from "express";
import { db } from "../prisma/db.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const plans = (await db.orm?.public?.InvestmentPlan?.all?.()) ?? [];

    return res.status(200).json({
      plans,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
});

export default router;