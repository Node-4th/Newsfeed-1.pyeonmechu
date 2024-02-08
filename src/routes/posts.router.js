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
        },
      },
      userId: true,
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

/** 게시글 상세 조회 API **/
router.get("/posts/:postId", async (req, res, next) => {
  const { postId } = req.params;

  if (!postId) {
    return res.status(400).json({
      success: false,
      message: "postId 는 필수값 입니다.",
    });
  }

  const post = await prisma.posts.findFirst({
    where: {
      postId: +postId,
    },
    select: {
      user: {
        select: {
          nickname: true,
        },
        postId: true,
        userId: true,
        title: true,
        content: true,
        imageURL: true,
        tag: true,
        category: true,
        like: true,
        unlike: true,
        createdAt: true,
        updatedAt: true,
      },
    },
  });

  if (!post) {
    return res.json({ messsage: "작성한 이력서가 없습니다." });
  }

  return res.status(200).json({ data: post });
});

/** 게시글 수정 */
router.patch("/posts/:postId", authMiddleware, async (req, res, next) => {
  const user = req.user;
  const postId = req.params.postId;
  const { title, content, imageURL, tag, category } = req.body;

  if (!postId) {
    return res.status(400).json({
      success: false,
      message: "postId는 필수값 입니다.",
    });
  }

  if (!title) {
    return res.status(400).json({
      success: false,
      message: "제목은 필수값 입니다.",
    });
  }

  if (!content) {
    return res.status(400).json({
      success: false,
      message: "내용은 필수값 입니다.",
    });
  }

  if (!category) {
    return res.status(400).json({
      success: false,
      message: "카테고리는 필수값 입니다.",
    });
  }

  const post = await prisma.posts.findFirst({
    where: {
      postId: Number(postId),
    },
  });

  if (!post) {
    return res.status(400).json({
      success: false,
      message: "게시글이 존재하지 않습니다.",
    });
  }

  if (post.userId !== user.userId) {
    return res.status(400).json({
      success: false,
      message: "올바르지 않은 요청입니다.",
    });
  }

  await prisma.posts.update({
    where: {
      postId: Number(postId),
    },
    data: {
      title,
      content,
      imageURL,
      tag,
      category,
    },
  });

  return res.status(201).json({
    success: true,
    message: "게시글 수정이 완료되었습니다.",
  });
});

export default router;
