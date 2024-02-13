import express from "express";
import { prisma } from "../utils/index.js";
import bcrypt from "bcrypt";
import authMiddleware from "../middlewares/auth.middleware.js";

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
      existingPassword,
      password,
      passwordConfirm,
      name,
      nickname,
      profileImage,
      aboutMe,
    } = req.body;
    const { userId } = req.user;

    const user = await prisma.users.findFirst({
      where: { userId: +userId },
    });

    if (!existingPassword)
      return res
        .status(400)
        .json({ success: false, message: "기존의 비밀 번호를 입력해 주세요." });

    const checkedPassword = await bcrypt.compare(
      existingPassword,
      user.password
    );

    if (!checkedPassword)
      return res
        .status(401)
        .json({ success: false, message: "기존의 비밀 번호와 다릅니다." });

    let hashedPassword = user.password;

    if (password !== undefined || passwordConfirm !== undefined) {
      if (!password)
        return res
          .status(400)
          .json({ message: "새로운 비밀번호를 입력해 주세요" });

      if (!passwordConfirm)
        return res
          .status(400)
          .json({ message: "새로운 비밀번호 확인을 입력해 주세요" });

      if (password !== passwordConfirm)
        return res.status(400).json({
          success: false,
          message: "비밀번호와 비밀번호 확인이 다릅니다.",
        });

      if (password.length < 6 || password.length > 20)
        return res.status(400).json({
          success: false,
          message: "비밀번호는 최소 6자리 이상, 최대 20자리 이하 입니다.",
        });

      hashedPassword = await bcrypt.hash(password, 10);
    }

    await prisma.users.update({
      where: { userId: +userId },
      data: {
        password: hashedPassword,
        name,
        nickname,
        profileImage,
        aboutMe,
      },
    });

    return res.status(201).json({
      success: true,
      message: "프로필 수정이 완료되었습니다.",
    });
  } catch (err) {
    next(err);
  }
});

// 회원 탈퇴
router.delete("/users/leave", authMiddleware, async (req, res, next) => {
  try {
    const { userId } = req.user;

    res.clearCookie("authorization");

    await prisma.users.delete({
      where: { userId: +userId },
    });

    return res.status(200).json({ message: "회원 탈퇴되었습니다." });
  } catch (err) {
    next(err);
  }
});

// 다른 사람 포스트 보기
router.get("/users/:userId", async (req, res, next) => {
  try {
    const { userId } = req.params;

    const user = await prisma.users.findFirst({
      where: { userId: +userId },
    });

    if (!user)
      return res.status(404).json({ message: "유저가 존재하지 않습니다." });

    const userProfile = await prisma.users.findFirst({
      where: { userId: +userId },
      select: {
        userId: true,
        nickname: true,
        profileImage: true,
        aboutMe: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const userPosts = await prisma.posts.findMany({
      where: { userId: +userId },
      select: {
        postId: true,
        userId: true,
        title: true,
        content: true,
        imageURL: true,
        tag: true,
        category: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return res.status(200).json({ userProfile, userPosts });
  } catch (err) {
    next(err);
  }
});

export default router;
