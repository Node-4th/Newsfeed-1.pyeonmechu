import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import { prisma } from "../utils/index.js";

const router = express.Router();

router.get("/sign-up", async (req, res, next) => {
  res.render("sign-up");
});

router.get("/sign-in", async (req, res) => {
  res.render("sign-in");
});

router.get("/main", (req, res) => {
  const data = { id: 1 };
  return res.render("index", { data });
});

router.get("/users/me", authMiddleware, async (req, res) => {
  const { userId } = req.user;

  const user = await prisma.users.findFirst({
    where: { userId: +userId },
  });
  return res.render("profile", { user });
});

router.get("/profile", authMiddleware, async (req, res) => {
  const { userId } = req.user;

  const user = await prisma.users.findFirst({
    where: { userId: +userId },
  });

  //const follows = await prisma.follows.findFirst({});

  return res.render("profile", { user });
});

router.get("/profiledetail", (req, res) => {
  const data = { id: 1 };
  return res.render("profiledetail", { data });
});

router.get("/post", authMiddleware, async (req, res) => {
  const { userId } = req.user;

  const user = await prisma.users.findFirst({
    where: { userId: +userId },
  });
  return res.render("post", { user });
});

export default router;
