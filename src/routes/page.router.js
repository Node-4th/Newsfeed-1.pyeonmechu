import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import { prisma } from "../utils/index.js";

const router = express.Router();

router.get("/sign-up", (req, res, next) => {
  res.render("sign-up");
});

router.get("/sign-in", (req, res) => {
  res.render("sign-in");
});

export default router;
