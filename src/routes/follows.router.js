import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import { prisma } from "../utils/index.js";

const router = express.Router();

// 팔로우 API
router.post(
  "/users/:userId/follows",
  authMiddleware,
  async (req, res, next) => {
    try {
      const followingId = req.params.userId;
      const followerId = req.user.userId;

      if (!followingId) {
        return res
          .status(404)
          .json({ success: false, message: "존재하지 않는 유저입니다." });
      }

      if (+followingId === +followerId) {
        return res.status(400).json({
          success: false,
          message: "스스로를 팔로우할 수는 없습니다.",
        });
      } // 이거 필요할까요?

      const isExistingFollowing = await prisma.follows.findFirst({
        where: { followerId: +followerId, followingId: +followingId },
      });

      if (isExistingFollowing) {
        return res
          .status(409)
          .json({ success: false, message: "이미 팔로우 한 유저입니다." });
      }

      const follow = await prisma.follows.create({
        data: {
          followingId: +followingId,
          followerId: +followerId,
        },
      });

      const followingUser = await prisma.users.findFirst({
        where: { userId: +followingId },
        select: {
          nickname: true,
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

export default router;
