import { db } from "./prisma/db.js";

async function createPlan() {
  const investmentPlan = db.orm?.public?.InvestmentPlan;

  if (!investmentPlan) {
    throw new Error("InvestmentPlan model is not available in the database ORM.");
  }

  const plan = await investmentPlan.create({
    name: "Starter",
    amount: 50,
    return: 60,
    duration: 30,
  });

  console.log("Investment plan created:");
  console.log(plan);
}

createPlan();