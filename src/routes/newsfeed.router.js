import express from "express";
import { prisma } from "../utils/index.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

// 게시글 목록 조회 (뉴스피드)
//메뉴추천 게시판
router.get("/posts/recommend", async (req, res, next) => {
  try {
    const sort = req.query.sort ?? "postId";

    if (!["postId"].includes(sort)) {
      return res.status(400).json({
        success: false,
        message: "sort가 올바르지 않습니다.",
      });
    }

    const posts = await prisma.posts.findMany({
      where: { category: "recommend" },
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
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        [sort]: "desc",
      },
    });

    if (!posts[0]) {
      return res.status(200).json({
        success: true,
        message: "아직 게시판에 게시글이 없습니다.",
      });
    }

    posts.forEach((posts) => {
      posts.nickname = posts.user.nickname;
      delete posts.user;
    });

    return res.status(200).json({ success: true, data: posts });
  } catch (err) {
    next(err);
  }
});

//조합공유 게시판
router.get("/posts/combination_share", async (req, res, next) => {
  try {
    const sort = req.query.sort ?? "postId";

    if (!["postId"].includes(sort)) {
      return res.status(400).json({
        success: false,
        message: "sort가 올바르지 않습니다.",
      });
    }

    const posts = await prisma.posts.findMany({
      where: { category: "combination_share" },
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
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        [sort]: "desc",
      },
    });

    if (!posts[0]) {
      return res.status(200).json({
        success: true,
        message: "아직 게시판에 게시글이 없습니다.",
      });
    }

    posts.forEach((posts) => {
      posts.nickname = posts.user.nickname;
      delete posts.user;
    });

    return res.status(200).json({ success: true, data: posts });
  } catch (err) {
    next(err);
  }
});

//이벤트 게시판
router.get("/posts/event_info", async (req, res, next) => {
  try {
    const sort = req.query.sort ?? "postId";

    if (!["postId"].includes(sort)) {
      return res.status(400).json({
        success: false,
        message: "sort가 올바르지 않습니다.",
      });
    }

    const posts = await prisma.posts.findMany({
      where: { category: "event_info" },
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
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        [sort]: "desc",
      },
    });

    if (!posts[0]) {
      return res.status(200).json({
        success: true,
        message: "아직 게시판에 게시글이 없습니다.",
      });
    }

    posts.forEach((posts) => {
      posts.nickname = posts.user.nickname;
      delete posts.user;
    });

    return res.status(200).json({ success: true, data: posts });
  } catch (err) {
    next(err);
  }
});

//팔로잉 피드 모아보기
router.get("/posts/feed", authMiddleware, async (req, res, next) => {
  try {
    const sort = req.query.sort ?? "postId";
    const userId = req.user.userId;

    if (!["postId"].includes(sort)) {
      return res.status(400).json({
        success: false,
        message: "sort가 올바르지 않습니다.",
      });
    }

    const followingList = await prisma.follows.findMany({
      where: { followerId: +userId },
    });

    if (!followingList[0]) {
      return res.status(200).json({
        success: true,
        message: "아직 팔로우한 유저가 없습니다.",
      });
    }

    const followingsId = followingList.map((obj) => obj.followingId);

    const posts = await prisma.posts.findMany({
      where: { userId: { in: followingsId } },
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
        category: true,
        star: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        [sort]: "desc",
      },
    });

    if (!posts[0]) {
      return res.status(200).json({
        success: true,
        message: "아직 게시글이 없습니다.",
      });
    }

    posts.forEach((posts) => {
      posts.nickname = posts.user.nickname;
      delete posts.user;
    });

    return res.status(200).json({ success: true, data: posts });
  } catch (err) {
    next(err);
  }
});

export default router;
