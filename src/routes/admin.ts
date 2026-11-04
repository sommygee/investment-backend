import express from "express";
import postgres from "postgres";
import { z } from "zod";
import { db } from "../prisma/db.js";
import {
  authenticateToken,
  requireAdmin,
  AuthRequest,
} from "../middleware/auth.js";

const sql = postgres(process.env.DATABASE_URL!);
const router = express.Router();

// Investment plan validation
const planSchema = z.object({
  name: z.string().trim().min(2),
  amount: z.number().positive(),
  return: z.number().positive(),
  duration: z.number().int().positive(),
});

// Test admin access
router.get(
  "/test",
  authenticateToken,
  requireAdmin,
  (_req: AuthRequest, res) => {
    return res.status(200).json({
      message: "Admin access confirmed",
    });
  }
);

// Get all users
router.get(
  "/users",
  authenticateToken,
  requireAdmin,
  async (_req: AuthRequest, res) => {
    try {
      const users = await db.orm.public.User.all();

      return res.status(200).json({
        users: users.map((user) => ({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
        })),
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: "Internal server error",
      });
    }
  }
);

// Get a specific user
router.get(
  "/users/:id",
  authenticateToken,
  requireAdmin,
  async (req: AuthRequest, res) => {
    try {
      const userId = Number(req.params.id);

      if (!Number.isInteger(userId) || userId <= 0) {
        return res.status(400).json({
          message: "Invalid user ID",
        });
      }

      const user = await db.orm.public.User
        .where({ id: userId })
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
          role: user.role,
          createdAt: user.createdAt,
        },
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: "Internal server error",
      });
    }
  }
);

// Get all investments
router.get(
  "/investments",
  authenticateToken,
  requireAdmin,
  async (_req: AuthRequest, res) => {
    try {
      const investments = await db.orm.public.Investment.all();

      return res.status(200).json({ investments });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: "Internal server error",
      });
    }
  }
);

// Get all withdrawals
router.get(
  "/withdrawals",
  authenticateToken,
  requireAdmin,
  async (_req: AuthRequest, res) => {
    try {
      const withdrawals = await db.orm.public.Withdrawal.all();

      return res.status(200).json({ withdrawals });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: "Internal server error",
      });
    }
  }
);

// Approve withdrawal
router.patch(
  "/withdrawals/:id/approve",
  authenticateToken,
  requireAdmin,
  async (req: AuthRequest, res) => {
    try {
      const withdrawalId = Number(req.params.id);

      if (!Number.isInteger(withdrawalId) || withdrawalId <= 0) {
        return res.status(400).json({
          message: "Invalid withdrawal ID",
        });
      }

      const withdrawal = await db.orm.public.Withdrawal
        .where({ id: withdrawalId })
        .first();

      if (!withdrawal) {
        return res.status(404).json({
          message: "Withdrawal not found",
        });
      }

      if (withdrawal.status !== "pending") {
        return res.status(400).json({
          message: "Only pending withdrawals can be approved",
        });
      }

      const result = await sql`
        UPDATE "Withdrawal"
        SET status = 'approved'
        WHERE id = ${withdrawalId}
          AND status = 'pending'
        RETURNING id, "userId", amount, status, "createdAt"
      `;

      if (result.length === 0) {
        return res.status(400).json({
          message: "Withdrawal has already been processed",
        });
      }

      return res.status(200).json({
        message: "Withdrawal approved successfully",
        withdrawal: result[0],
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: "Internal server error",
      });
    }
  }
);

// Reject withdrawal
router.patch(
  "/withdrawals/:id/reject",
  authenticateToken,
  requireAdmin,
  async (req: AuthRequest, res) => {
    try {
      const withdrawalId = Number(req.params.id);

      if (!Number.isInteger(withdrawalId) || withdrawalId <= 0) {
        return res.status(400).json({
          message: "Invalid withdrawal ID",
        });
      }

      const withdrawal = await db.orm.public.Withdrawal
        .where({ id: withdrawalId })
        .first();

      if (!withdrawal) {
        return res.status(404).json({
          message: "Withdrawal not found",
        });
      }

      if (withdrawal.status !== "pending") {
        return res.status(400).json({
          message: "Only pending withdrawals can be rejected",
        });
      }

      const result = await sql`
        UPDATE "Withdrawal"
        SET status = 'rejected'
        WHERE id = ${withdrawalId}
          AND status = 'pending'
        RETURNING id, "userId", amount, status, "createdAt"
      `;

      if (result.length === 0) {
        return res.status(400).json({
          message: "Withdrawal has already been processed",
        });
      }

      return res.status(200).json({
        message: "Withdrawal rejected successfully",
        withdrawal: result[0],
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: "Internal server error",
      });
    }
  }
);

// Add investment plan
router.post(
  "/plans",
  authenticateToken,
  requireAdmin,
  async (req: AuthRequest, res) => {
    try {
      const result = planSchema.safeParse(req.body);

      if (!result.success) {
        return res.status(400).json({
          message: "Invalid investment plan details",
          errors: result.error.issues,
        });
      }

      const {
        name,
        amount,
        return: planReturn,
        duration,
      } = result.data;

      const plan = await db.orm.public.InvestmentPlan.create({
        name,
        amount,
        return: planReturn,
        duration,
      });

      return res.status(201).json({
        message: "Investment plan created successfully",
        plan,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: "Internal server error",
      });
    }
  }
);

// Edit investment plan
router.patch(
  "/plans/:id",
  authenticateToken,
  requireAdmin,
  async (req: AuthRequest, res) => {
    try {
      const planId = Number(req.params.id);

      if (!Number.isInteger(planId) || planId <= 0) {
        return res.status(400).json({
          message: "Invalid plan ID",
        });
      }

      const result = planSchema.safeParse(req.body);

      if (!result.success) {
        return res.status(400).json({
          message: "Invalid investment plan details",
          errors: result.error.issues,
        });
      }

      const existingPlan = await db.orm.public.InvestmentPlan
        .where({ id: planId })
        .first();

      if (!existingPlan) {
        return res.status(404).json({
          message: "Investment plan not found",
        });
      }

      const {
        name,
        amount,
        return: planReturn,
        duration,
      } = result.data;

      const updated = await sql`
        UPDATE "InvestmentPlan"
        SET
          name = ${name},
          amount = ${amount},
          "return" = ${planReturn},
          duration = ${duration}
        WHERE id = ${planId}
        RETURNING id, name, amount, "return", duration, "createdAt"
      `;

      return res.status(200).json({
        message: "Investment plan updated successfully",
        plan: updated[0],
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: "Internal server error",
      });
    }
  }
);

export default router;
