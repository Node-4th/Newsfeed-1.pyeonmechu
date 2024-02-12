import express from "express";
import { prisma } from "../utils/index.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/posts/:postId/likes", authMiddleware, async (req, res, next) => {
  try {
    const { postId } = req.params;
    const { userId } = req.user;

    const post = await prisma.posts.findFirst({
      where: { postId: +postId },
    });
    if (!post)
      return res.status(404).json({ message: "게시글이 존재하지 않습니다." });

    const isAlreadyLike = await prisma.likes.findFirst({
      where: { postId: +postId, userId: +userId },
    });

    if (post.userId === +userId) {
      res.status(403).json({ message: "자신의 게시물엔 추천할 수 없습니다." });
    }

    if (isAlreadyLike) {
      await prisma.likes.delete({ where: { likeId: isAlreadyLike.likeId } });

      return res.status(200).json({ message: "추천 취소되었습니다." });
    }

    await prisma.likes.create({
      data: {
        postId: +postId,
        userId: +userId,
      },
    });

    return res.status(201).json({ message: "추천하였습니다." });
  } catch (err) {
    next(err);
  }
});

router.post("/posts/:postId/hates", authMiddleware, async (req, res, next) => {
  try {
    const { postId } = req.params;
    const { userId } = req.user;

    const post = await prisma.posts.findFirst({
      where: { postId: +postId },
    });
    if (!post)
      return res.status(404).json({ message: "게시글이 존재하지 않습니다." });

    if (post.userId === +userId) {
      res
        .status(403)
        .json({ message: "자신의 게시물엔 비추천할 수 없습니다." });
    }

    const isAlreadyHate = await prisma.hates.findFirst({
      where: { postId: +postId, userId: +userId },
    });

    if (isAlreadyHate) {
      await prisma.hates.delete({ where: { hateId: isAlreadyHate.hateId } });

      return res.status(200).json({ message: "비추천 취소되었습니다." });
    }

    await prisma.hates.create({
      data: {
        postId: +postId,
        userId: +userId,
      },
    });

    return res.status(201).json({ message: "비추천하였습니다." });
  } catch (err) {
    next(err);
  }
});

export default router;
