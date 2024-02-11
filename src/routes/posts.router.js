import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import { prisma } from "../utils/index.js";

const router = express.Router();
// express.Router()를 이용해 라우터를 생성합니다.

// 게시글 생성
router.post("/posts", authMiddleware, async (req, res, next) => {
  const { title, content, imageURL, tag, category, star } = req.body;
  const { userId } = req.user;

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

  const post = await prisma.posts.create({
    data: {
      userId: Number(userId),
      title,
      content,
      imageURL,
      tag,
      category: category.toLowerCase(),
      star,
    },
  });

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
      [orderKey]: orderValue.toLowerCase(),
    },
  });

  return res.status(200).json({ data: posts });
});

/** 게시글 상세 조회 API **/
router.get("/posts/:postId", async (req, res, next) => {
  const { postId } = req.params;

  const post = await prisma.posts.findFirst({
    where: {
      postId: Number(postId),
    },
  });

  if (!post) {
    return res.status(400).json({
      success: false,
      messsage: "작성한 게시물이 없습니다.",
    });
  }

  return res.status(200).json({ data: post });
});

/** 게시글 수정 */
router.patch("/posts/:postId", authMiddleware, async (req, res, next) => {
  const user = req.user;
  const postId = req.params.postId;
  const { title, content, imageURL, tag, star, category } = req.body;

  // if (!title) {
  //   return res.status(400).json({
  //     success: false,
  //     message: "제목은 필수값 입니다.",
  //   });
  // }

  // if (!content) {
  //   return res.status(400).json({
  //     success: false,
  //     message: "내용은 필수값 입니다.",
  //   });
  // }

  // if (!category) {
  //   return res.status(400).json({
  //     success: false,
  //     message: "카테고리는 필수값 입니다.",
  //   });
  // }

  const post = await prisma.posts.findFirst({
    where: {
      postId: Number(postId),
    },
  });

  if (!post) {
    return res.status(404).json({
      success: false,
      message: "게시글이 존재하지 않습니다.",
    });
  }

  if (post.userId !== user.userId && user.grade === "USER") {
    return res.status(401).json({
      success: false,
      message: "해당 게시글의 수정 권한이 없습니다.",
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
      star,
      category,
    },
  });

  return res.status(201).json({
    success: true,
    message: "게시글 수정이 완료되었습니다.",
  });
});

/** 게시글 삭제 */
router.delete("/posts/:postId", authMiddleware, async (req, res, next) => {
  const user = req.user;
  const postId = req.params.postId;

  const post = await prisma.posts.findFirst({
    where: {
      postId: Number(postId),
    },
  });

  if (!post) {
    return res.status(404).json({
      success: false,
      message: "게시글이 존재하지 않습니다.",
    });
  }

  if (post.userId !== user.userId && user.grade === "USER") {
    return res.status(401).json({
      success: false,
      message: "해당 게시글의 삭제 권한이 없습니다.",
    });
  }

  await prisma.posts.delete({
    where: {
      postId: Number(postId),
    },
  });

  return res
    .status(201)
    .json({
      success: true,
      message: "게시글 삭제가 완료되었습니다.",
    })
    .redirect("/posts");
});

export default router;
