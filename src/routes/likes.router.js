import express from "express";
import { prisma } from "../utils/index.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

//게시글 추천 API
router.post("/posts/:postId/likes", authMiddleware, async (req, res, next) => {
  try {
    const { postId } = req.params;
    const { userId } = req.user;

    const post = await prisma.posts.findFirst({
      where: { postId: +postId },
    });
    if (!post)
      return res
        .status(404)
        .json({ success: false, message: "게시글이 존재하지 않습니다." });

    const isAlreadyLike = await prisma.likes.findFirst({
      where: { postId: +postId, userId: +userId, commentId: null },
    });

    if (post.userId === +userId) {
      return res.status(403).json({
        success: false,
        message: "자신의 게시물엔 추천할 수 없습니다.",
      });
    }

    if (isAlreadyLike) {
      await prisma.likes.delete({ where: { likeId: isAlreadyLike.likeId } });

      return res
        .status(200)
        .json({ success: true, message: "추천 취소되었습니다." });
    }

    await prisma.likes.create({
      data: {
        postId: +postId,
        userId: +userId,
      },
    });

    return res.status(201).json({ success: true, message: "추천하였습니다." });
  } catch (err) {
    next(err);
  }
});

//게시글 비추 API
router.post("/posts/:postId/hates", authMiddleware, async (req, res, next) => {
  try {
    const { postId } = req.params;
    const { userId } = req.user;

    const post = await prisma.posts.findFirst({
      where: { postId: +postId },
    });
    if (!post)
      return res
        .status(404)
        .json({ success: false, message: "게시글이 존재하지 않습니다." });

    if (post.userId === +userId) {
      return res.status(403).json({
        success: false,
        message: "자신의 게시물엔 비추천할 수 없습니다.",
      });
    }

    const isAlreadyHate = await prisma.hates.findFirst({
      where: { postId: +postId, userId: +userId, commentId: null },
    });

    if (isAlreadyHate) {
      await prisma.hates.delete({ where: { hateId: isAlreadyHate.hateId } });

      return res
        .status(200)
        .json({ success: true, message: "비추천 취소되었습니다." });
    }

    await prisma.hates.create({
      data: {
        postId: +postId,
        userId: +userId,
      },
    });

    return res
      .status(201)
      .json({ success: true, message: "비추천하였습니다." });
  } catch (err) {
    next(err);
  }
});

//댓글 추천 API
router.post(
  "/posts/:postId/:commentId/likes",
  authMiddleware,
  async (req, res, next) => {
    try {
      const { postId, commentId } = req.params;
      const { userId } = req.user;

      const post = await prisma.posts.findFirst({
        where: { postId: +postId },
      });
      if (!post)
        return res
          .status(404)
          .json({ success: false, message: "게시글이 존재하지 않습니다." });

      const comment = await prisma.comments.findFirst({
        where: { postId: +postId, commentId: +commentId },
      });
      if (!comment)
        return res
          .status(404)
          .json({ success: false, message: "댓글이 존재하지 않습니다." });

      if (comment.userId === +userId) {
        return res.status(403).json({
          success: false,
          message: "자신의 댓글엔 추천할 수 없습니다.",
        });
      }

      const isAlreadyLike = await prisma.likes.findFirst({
        where: { postId: +postId, userId: +userId, commentId: +commentId },
      });

      if (isAlreadyLike) {
        await prisma.likes.delete({ where: { likeId: isAlreadyLike.likeId } });

        return res
          .status(200)
          .json({ success: true, message: "추천 취소되었습니다." });
      }

      await prisma.likes.create({
        data: {
          postId: +postId,
          userId: +userId,
          commentId: +commentId,
        },
      });

      return res
        .status(201)
        .json({ success: true, message: "추천하였습니다." });
    } catch (err) {
      next(err);
    }
  }
);

//댓글 비추 API
router.post(
  "/posts/:postId/:commentId/hates",
  authMiddleware,
  async (req, res, next) => {
    try {
      const { postId, commentId } = req.params;
      const { userId } = req.user;

      const post = await prisma.posts.findFirst({
        where: { postId: +postId },
      });
      if (!post)
        return res
          .status(404)
          .json({ success: false, message: "게시글이 존재하지 않습니다." });

      const comment = await prisma.comments.findFirst({
        where: { postId: +postId, commentId: +commentId },
      });
      if (!comment)
        return res
          .status(404)
          .json({ success: false, message: "댓글이 존재하지 않습니다." });

      if (comment.userId === +userId) {
        return res.status(403).json({
          success: false,
          message: "자신의 댓글엔 비추천할 수 없습니다.",
        });
      }

      const isAlreadyHate = await prisma.hates.findFirst({
        where: { postId: +postId, userId: +userId, commentId: +commentId },
      });

      if (isAlreadyHate) {
        await prisma.hates.delete({ where: { hateId: isAlreadyHate.hateId } });

        return res
          .status(200)
          .json({ success: true, message: "비추천 취소되었습니다." });
      }

      await prisma.hates.create({
        data: {
          postId: +postId,
          userId: +userId,
          commentId: +commentId,
        },
      });

      return res
        .status(201)
        .json({ success: true, message: "비추천하였습니다." });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
