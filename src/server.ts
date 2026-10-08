import express from "express";
import authRouter from "./routes/auth.js";
import userRouter from "./routes/user.js";

const app = express();

app.use(express.json());
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);

const PORT = 3000;

app.get("/", (req, res) => {
  res.json({
    message: "Investment backend is running",
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});