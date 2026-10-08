import express from "express";
import postgres from "postgres";
import { db } from "../prisma/db.js";
import {
  authenticateToken,
  requireAdmin,
  AuthRequest,
} from "../middleware/auth.js";

const sql = postgres(process.env.DATABASE_URL!);

const router = express.Router();

// Test admin access
router.get(
  "/test",
  authenticateToken,
  requireAdmin,
  (req: AuthRequest, res) => {
    res.status(200).json({
      message: "Admin access confirmed",
    });
  }
);

// Get all users
router.get(
  "/users",
  authenticateToken,
  requireAdmin,
  async (req: AuthRequest, res) => {
    try {
      const userModel = db?.orm?.public?.User;

      if (!userModel) {
        return res.status(500).json({
          message: "Database model unavailable",
        });
      }

      const users = await userModel.all();

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

// Get all investments
router.get(
  "/investments",
  authenticateToken,
  requireAdmin,
  async (req: AuthRequest, res) => {
    try {
      const investmentModel = db?.orm?.public?.Investment;

      if (!investmentModel) {
        return res.status(500).json({
          message: "Database model unavailable",
        });
      }

      const investments = await investmentModel.all();

      return res.status(200).json({
        investments,
      });
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
  async (req: AuthRequest, res) => {
    try {
      const withdrawalModel = db?.orm?.public?.Withdrawal;

      if (!withdrawalModel) {
        return res.status(500).json({
          message: "Database model unavailable",
        });
      }

      const withdrawals = await withdrawalModel.all();

      return res.status(200).json({
        withdrawals,
      });
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

      const withdrawalModel = db?.orm?.public?.Withdrawal;

      if (!withdrawalModel) {
        return res.status(500).json({
          message: "Database model unavailable",
        });
      }

      const withdrawal = await withdrawalModel
        .where({ id: withdrawalId })
        .first();

      if (!withdrawal) {
        return res.status(404).json({
          message: "Withdrawal not found",
        });
      }

      const result = await sql`
        UPDATE "Withdrawal"
        SET status = 'approved'
        WHERE id = ${withdrawalId}
        RETURNING id, "userId", amount, status, "createdAt"
      `;

      const updatedWithdrawal = result[0];

      return res.status(200).json({
        message: "Withdrawal approved successfully",
        withdrawal: updatedWithdrawal,
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
