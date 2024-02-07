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

export default router;
