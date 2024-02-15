import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import { prisma } from "../utils/index.js";

const router = express.Router();

//게시글 생성 API
router.post("/posts", authMiddleware, async (req, res, next) => {
  try {
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
    if (
      !category ||
      !["recommend", "combination_share", "event_info"].includes(category)
    ) {
      return res.status(400).json({
        success: false,
        message: "카테고리가 올바르지 않습니다.",
      });
    }

    if (
      star != undefined &&
      (!Number.isInteger(star) || star < 1 || star > 5)
    ) {
      return res.status(400).json({
        success: false,
        message: "별점은 1~5 값 입니다.",
      });
    }

    const post = await prisma.posts.create({
      data: {
        userId: +userId,
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
      success: true,
      message: "게시글이 작성되었습니다.",
    });
  } catch (err) {
    next(err);
  }
});

//게시글 상세 조회 API
router.get("/posts/:postId", async (req, res, next) => {
  try {
    const { postId } = req.params;

    const post = await prisma.posts.findFirst({
      where: {
        postId: +postId,
      },
      select: {
        user: {
          select: {
            name: true,
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
    });

    if (!post.user) {
      post.user = { nickname: "탈퇴한 유저" };
    }
    post.nickname = post.user.nickname ?? post.user.name;
    delete post.user;

    post.likes = await prisma.likes.count({ where: { postId: post.postId } });
    post.hates = await prisma.hates.count({ where: { postId: post.postId } });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "게시글이 존재하지 않습니다.",
      });
    }

    return res
      .status(200)
      .json({ data: post, success: true, message: "게시글이 조회되었습니다." });
  } catch (err) {
    next(err);
  }
});

//게시글 수정 API
router.patch("/posts/:postId", authMiddleware, async (req, res, next) => {
  try {
    const user = req.user;
    const postId = req.params.postId;
    const { title, content, imageURL, tag, star, category } = req.body;

    const post = await prisma.posts.findFirst({
      where: {
        postId: +postId,
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

    if (
      category &&
      !["recommend", "combination_share", "event_info"].includes(category)
    ) {
      return res.status(400).json({
        success: false,
        message: "카테고리가 올바르지 않습니다.",
      });
    }

    if (
      star != undefined &&
      (!Number.isInteger(star) || star < 1 || star > 5)
    ) {
      return res.status(400).json({
        success: false,
        message: "별점은 1~5 값 입니다.",
      });
    }

    const updateData = {
      title: title !== "" ? title : post.title,
      content: content !== "" ? content : post.content,
      imageURL: imageURL !== "" ? imageURL : post.imageURL,
      tag: tag !== "" ? tag : post.tag,
      category: category !== "" ? category : post.category,
      star: star !== "" ? star : post.star,
    };

    await prisma.posts.update({
      where: {
        postId: +postId,
      },
      data: updateData,
    });

    return res.status(201).json({
      success: true,
      message: "게시글 수정이 완료되었습니다.",
    });
  } catch (err) {
    next(err);
  }
});

//게시글 삭제 API
router.delete("/posts/:postId", authMiddleware, async (req, res, next) => {
  try {
    const user = req.user;
    const postId = req.params.postId;

    const post = await prisma.posts.findFirst({
      where: {
        postId: +postId,
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
        postId: +postId,
      },
    });

    return res.status(200).json({
      success: true,
      message: "게시글 삭제가 완료되었습니다.",
    });
  } catch (err) {
    next(err);
  }
});

export default router;
