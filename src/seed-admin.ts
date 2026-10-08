import bcrypt from "bcrypt";
import { db } from "./prisma/db.js";

async function createAdmin() {
  const hashedPassword = await bcrypt.hash("Admin1234!", 10);

  const userModel = db.orm?.public?.User;

  if (!userModel) {
    throw new Error("User model is not available in the database client.");
  }

  const admin = await userModel.create({
    name: "Admin User",
    email: "admin@example.com",
    password: hashedPassword,
    role: "admin",
  });

  console.log("Admin created:");
  console.log({
    id: admin.id,
    name: admin.name,
    email: admin.email,
    role: admin.role,
  });
}

createAdmin();