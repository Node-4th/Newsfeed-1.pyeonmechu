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
        return res.status(404).json({
          success: false,
          message: "팔로우하려는 유저를 지정해주세요.",
        });
      }

      const followingUser = await prisma.users.findFirst({
        where: { userId: +followingId },
        select: {
          nickname: true,
        },
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
        select: { followId: true },
      });
      //이미 팔로우 한 사람이면 언팔로우
      if (isExistingFollowing) {
        await prisma.follows.delete({
          where: {
            followId: isExistingFollowing.followId,
          },
        });

        return res.status(201).json({
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

// 언팔로우 API
// router.delete(
//   "/users/:userId/follows",
//   authMiddleware,
//   async (req, res, next) => {
//     try {
//       const followingId = req.params.userId;
//       const followerId = req.user.userId;

//       if (!followingId) {
//         return res.status(404).json({
//           success: false,
//           message: "언팔로우하려는 유저를 지정해주세요.",
//         });
//       }

//       const followingUser = await prisma.users.findFirst({
//         where: { userId: +followingId },
//         select: {
//           nickname: true,
//         },
//       });

//       if (!followingUser) {
//         return res
//           .status(404)
//           .json({ success: false, message: "존재하지 않는 유저입니다." });
//       }

//       const Follow = await prisma.follows.findFirst({
//         where: { followerId: +followerId, followingId: +followingId },
//         select: { followId: true },
//       });

//       if (!Follow) {
//         return res
//           .status(404)
//           .json({ success: false, message: "팔로우한 적 없는 유저입니다." });
//       }

//       const unfollow = await prisma.follows.delete({
//         where: {
//           followId: Follow.followId,
//         },
//       });

//       return res.status(201).json({
//         success: true,
//         message: `${followingUser.nickname}님을 언팔로우하였습니다.`,
//       });
//     } catch (err) {
//       next(err);
//     }
//   }
// );

export default router;
