import express from "express";
import { prisma } from "../utils/index.js";

const router = express.Router();

// 프로필 조회
router.get("/users/me", authMiddleware, async (req, res, next) => {
  try {
    const { userId } = req.user;

    const user = await prisma.users.findFirst({
      where: { userId: +userId },
      select: {
        userId: true,
        email: true,
        name: true,
        nickname: true,
        profileImage: true,
        aboutMe: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return res.status(200).json({ data: user });
  } catch (err) {
    next(err);
  }
});

//프로필 수정
router.patch("/users/me", authMiddleware, async (req, res, next) => {
  try {
    const {
      email,
      password,
      passConfirm,
      name,
      nickname,
      profileImage,
      aboutMe,
    } = req.body;
    const { userId } = req.user;

    const user = await prisma.users.findFirst({
      where: { userId: +userId },
    });

    if (!user && user.grade === "USER")
      return res.status(401).json({ message: "수정할 권한이 없습니다." });
    if (!email)
      return res.status(401).json({ message: "이미엘은 필수값입니다." });
    if (!password)
      return res.status(401).json({ message: "비밀번호는 필수값입니다." });
    if (password !== passConfirm)
      return res
        .status(401)
        .json({ message: "비밀번호와 비밀번호 확인이 일치하지 않습니다." });
    if (name) return res.status(401).json({ message: "이름은 필수값입니다." });

    await prisma.users.update({
      where: { userId: +userId },
      data: {
        email,
        password,
        name,
        nickname,
        profileImage,
        aboutMe,
      },
    });

    return (
      res.status(200),
      json({ success: true, message: "프로필 수정이 완료되었습니다." })
    );
  } catch (err) {
    next(err);
  }
});

// 회원 탈퇴
router.delete("/users/leave", authMiddleware, async (req, res, next) => {
  try {
    const { userId } = req.user;

    const user = await prisma.users.findFirst({
      where: { userId: +userId },
    });

    if (!user)
      return res.status(404).json({ message: "찾는 사용자가 없습니다.." });

    await prisma.users.delete({
      where: { userId: +userId },
    });
    res.clearCookie("authorization");
    return res
      .status(200)
      .json({ success: true, message: "회원 탈퇴되었습니다." });
  } catch (err) {
    next(err);
  }
});

// 다른 사람 포스트 보기
router.get("/users/:userId", authMiddleware, async (req, res, next) => {
  try {
    const { params } = req.params;
    const { userId } = req.user;

    const othersPost = await prisma.posts.findMany({
      where: { postId },
    });

    if (othersPost !== params)
      return res.status(404).json({ message: "존재하지 않는 글입니다." });

    if (othersPost.userId !== userId) {
      const otherPost = await prisma.posts.findMany({
        where: { userId: +params },
        select: {
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
          users: {
            select: {
              userId: true,
              email: true,
              mame: true,
              nickname: true,
              profileImage: true,
              aboutMe: true,
            },
          },
        },
      });

      return res.status(200).json({ data: otherPost });
    }
  } catch (err) {
    next(err);
  }
});

export default router;
