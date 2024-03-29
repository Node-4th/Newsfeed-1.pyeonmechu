import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import { prisma } from "../utils/index.js";

const router = express.Router();

//팔로우 API
router.post(
  "/users/:userId/follows",
  authMiddleware,
  async (req, res, next) => {
    try {
      const followingId = req.params.userId;
      const followerId = req.user.userId;

      if (!followingId) {
        return res.status(400).json({
          success: false,
          message: "팔로우하려는 유저를 지정해주세요.",
        });
      }

      const followingUser = await prisma.users.findFirst({
        where: { userId: +followingId },
      });

      if (!followingUser) {
        return res
          .status(404)
          .json({ success: false, message: "존재하지 않는 유저입니다." });
      }

      if (+followingId === +followerId) {
        return res.status(400).json({
          success: false,
          message: "스스로를 팔로우할 수는 없습니다.",
        });
      }

      const isExistingFollowing = await prisma.follows.findFirst({
        where: { followerId: +followerId, followingId: +followingId },
      });
      if (isExistingFollowing) {
        await prisma.follows.delete({
          where: {
            followId: isExistingFollowing.followId,
          },
        });

        return res.status(200).json({
          success: true,
          message: `${followingUser.nickname}님을 언팔로우했습니다.`,
        });
      }

      const follow = await prisma.follows.create({
        data: {
          followingId: +followingId,
          followerId: +followerId,
        },
      });

      return res.status(201).json({
        success: true,
        message: `${followingUser.nickname}님을 팔로우하였습니다.`,
      });
    } catch (err) {
      next(err);
    }
  }
);

//해당 유저의 팔로잉 목록보기 API
router.get("/users/:userId/followings", async (req, res, next) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "userId는 필수로 입력되어야합니다." });
    }

    const user = await prisma.users.findFirst({
      where: { userId: +userId },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "해당 유저를 찾을 수 없습니다.",
      });
    }

    const followingList = await prisma.follows.findMany({
      where: { followerId: +userId },
      select: {
        followingId: true,
        followingUser: {
          select: {
            nickname: true,
          },
        },
      },
      orderBy: { followId: "desc" },
    });

    if (!followingList[0]) {
      return res
        .status(200)
        .json({ success: true, message: "아직 팔로잉이 없습니다." });
    }

    followingList.forEach((follows) => {
      follows.nickname = follows.followingUser.nickname;
      delete follows.followingUser;
    });

    return res.status(200).json({ success: true, data: followingList });
  } catch (err) {
    next(err);
  }
});

//해당 유저의 팔로워 목록보기 API
router.get("/users/:userId/followers", async (req, res, next) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "userId는 필수로 입력되어야합니다." });
    }

    const user = await prisma.users.findFirst({
      where: { userId: +userId },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "해당 유저를 찾을 수 없습니다.",
      });
    }

    const followerList = await prisma.follows.findMany({
      where: { followingId: +userId },
      select: {
        followerId: true,
        followerUser: {
          select: {
            nickname: true,
          },
        },
      },
      orderBy: { followId: "desc" },
    });

    if (!followerList[0]) {
      return res
        .status(200)
        .json({ success: true, message: "아직 팔로워가 없습니다" });
    }

    followerList.forEach((follows) => {
      follows.nickname = follows.followerUser.nickname;
      delete follows.followerUser;
    });

    return res.status(200).json({ success: true, data: followerList });
  } catch (err) {
    next(err);
  }
});

export default router;
