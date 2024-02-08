import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import { prisma } from "../utils/index.js";

const router = express.Router();
// express.Router()를 이용해 라우터를 생성합니다.

// 게시글 생성
router.post("/posts", authMiddleware, async (req, res, next) => {
  const { title, content, imageURL, tag, category } = req.body;
  const { userId } = req.user;

  const post = await prisma.posts.create({
    data: {
      userId: +userId,
      title,
      content,
      imageURL,
      tag,
      category,
    },
  });

  if (!title) {
    return res.status(400).json({
      success: false,
      message: "제목은 필수값입니다.",
    });
  }

  if (!content) {
    return res.status(400).json({
      success: false,
      message: "내용은 필수값입니다.",
    });
  }

  return res.status(201).json({
    data: post,
    message: "게시글이 작성되었습니다.",
  });
});

/** 게시글 목록 조회 API **/
router.get("/posts", async (req, res, next) => {
  const orderKey = req.query.orderKey ?? "postId";
  const orderValue = req.query.orderValue ?? "desc";

  if (!["postId", "category"].includes(orderKey)) {
    return res.status(400).json({
      success: false,
      message: "orderKey가 올바르지 않습니다.",
    });
  }

  if (!["asc", "desc"].includes(orderValue.toLowerCase())) {
    return res.status(400).json({
      success: false,
      message: "orderValue 가 올바르지 않습니다.",
    });
  }

  const posts = await prisma.posts.findMany({
    select: {
      user: {
        select: {
          nickname: true,
          userId: true,
        },
      },
      postId: true,
      title: true,
      content: true,
      imageURL: true,
      tag: true,
      star: true,
      category: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: {
      createdAt: orderValue.toLowerCase(),
    },
  });

  return res.status(200).json({ data: posts });
});

export default router;
