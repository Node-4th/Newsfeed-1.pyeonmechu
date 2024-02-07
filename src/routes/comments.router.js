import express from "express";
import { prisma } from "../utils/index.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

//댓글 생성 API

router.post(
  "/posts/:postId/comments",
  authMiddleware,
  async (req, res, next) => {
    const { postId } = req.params;
    const { userId } = req.user;
    const { content } = req.body;

    if (!postId) {
      return res.status(400).json({
        success: false,
        message: "postId는 필수로 입력되어야 합니다.",
      });
    }

    if (!content) {
      return res
        .status(400)
        .json({ success: false, message: "댓글 내용을 입력해주세요." });
    }

    const post = await prisma.posts.findFirst({ where: { postId: +postId } });

    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "해당 게시물을 찾을 수 없습니다." });
    }

    const comment = await prisma.comments.create({
      data: {
        postId: +postId,
        userId: +userId,
        content: content,
      },
    });

    return res
      .status(201)
      .json({ success: true, message: "댓글이 저장되었습니다." });
  }
);

//댓글 조회 API

router.get("/posts/:postId/comments", async (req, res, next) => {
  const { postId } = req.params;

  if (!postId) {
    return res
      .status(400)
      .json({ success: false, message: "postId는 필수로 입력되어야 합니다." });
  }

  const post = await prisma.posts.findFirst({ where: { postId: +postId } });

  if (!post) {
    return res
      .status(404)
      .json({ success: false, message: "해당 게시물을 찾을 수 없습니다." });
  }
  const comments = await prisma.comments.findMany({
    where: { postId: +postId },
    select: {
      content: true,
      user: {
        select: {
          nickname: true,
        },
      },
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { createdAt: "asc" },
  });

  return res.status(200).json({ data: comments });
});

//댓글 수정 API

router.patch(
  "/posts/:postId/comments/:commentId",
  authMiddleware,
  async (req, res, next) => {
    const { postId, commentId } = req.params;
    const user = req.user;
    const { content } = req.body;

    if (!postId) {
      return res.status(400).json({
        success: false,
        message: "postId는 필수로 입력되어야 합니다.",
      });
    }

    if (!commentId) {
      return res.status(400).json({
        success: false,
        message: "commentId는 필수로 입력되어야 합니다.",
      });
    }

    if (!content) {
      return res.status(404).json({
        success: false,
        message: "수정할 내용을 입력해주세요.",
      });
    }

    const post = await prisma.posts.findFirst({ where: { postId: +postId } });

    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "해당 게시물을 찾을 수 없습니다." });
    }

    const comment = await prisma.comments.findFirst({
      where: { commentId: +commentId },
    });

    if (!comment) {
      return res
        .status(404)
        .json({ success: false, message: "해당 댓글을 찾을 수 없습니다." });
    }

    if (user.grade === "USER" && user.userId !== comment.userId) {
      return res.status(401).json({
        success: false,
        message: "댓글을 수정할 권한이 없습니다.",
      });
    }

    await prisma.comments.update({
      where: { commentId: +commentId },
      data: { content: content },
    });

    return res.status(200).json({ message: "댓글 수정사항이 저장되었습니다." });
  }
);

//댓글 삭제 API

router.delete(
  "/posts/:postId/comments/:commentId",
  authMiddleware,
  async (req, res, next) => {
    const { postId, commentId } = req.params;
    const user = req.user;

    if (!postId) {
      return res.status(400).json({
        success: false,
        message: "postId는 필수로 입력되어야 합니다.",
      });
    }

    if (!commentId) {
      return res.status(400).json({
        success: false,
        message: "commentId는 필수로 입력되어야 합니다.",
      });
    }

    const post = await prisma.posts.findFirst({ where: { postId: +postId } });

    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "해당 게시물을 찾을 수 없습니다." });
    }

    const comment = await prisma.comments.findFirst({
      where: { commentId: +commentId },
    });

    if (!comment) {
      return res
        .status(404)
        .json({ success: false, message: "해당 댓글을 찾을 수 없습니다." });
    }

    if (user.grade === "USER" && user.userId !== comment.userId) {
      return res.status(401).json({
        success: false,
        message: "댓글을 삭제할 권한이 없습니다.",
      });
    }

    await prisma.comments.delete({
      where: { commentId: +commentId },
    });

    return res.status(200).json({ message: "댓글이 삭제되었습니다." });
  }
);

export default router;
