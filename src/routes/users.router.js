import express, { json } from "express";
import { prisma } from "../utils/index.js";
import bcrypt from "bcrypt";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

// 회원가입 API
router.post("/sign-up", async (req, res, next) => {
  try {
    const {
      email,
      password,
      passwordConfirm,
      name,
      nickname,
      profileImage,
      aboutMe,
      grade = "USER",
    } = req.body;
    // 권한 설정
    if (grade && !["USER", "ADMIN"].includes(grade)) {
      return res
        .status(400)
        .json({ success: false, message: "권한 설정이 올바르지 않습니다." });
    }
    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "이메일을 입력해주세요" });
    }
    // 비밀번호 존재 유무
    if (!password) {
      return res
        .status(400)
        .json({ success: false, message: "비밀번호를 입력해주세요" });
    }
    // 비밀번호의 길이
    if (password.length < 6 || password.length > 20) {
      return res.status(400).json({
        success: false,
        message: "비밀번호는 최소 6자리 이상, 최대 20자리 이하 입니다.",
      });
    }
    // 비밀번호 확인
    if (password !== passwordConfirm) {
      return res.status(400).json({ message: "비밀번호가 일치하지 않습니다." });
    }
    // 이름 존재 유무
    if (!name) {
      return res
        .status(400)
        .json({ success: false, message: "이름을 입력해주세요" });
    }
    // 닉네임 존재 유무
    if (!nickname) {
      return res
        .status(400)
        .json({ success: false, message: "닉네임을 입력해주세요." });
    }
    // // 프로필이미지 존재 유무
    // if (!profileImage) {
    //   return res
    //     .status(400)
    //     .json({ success: false, message: "프로필 이미지를 등록해주세요." });
    // }
    // // 자기소개 존재 유무
    // if (!aboutMe) {
    //   return res
    //     .status(400)
    //     .json({ success: false, message: "자기소개를 작성해주세요." });
    // 이메일 확인
    const isExistUser = await prisma.users.findFirst({
      where: { email },
    });
    // 이메일 중복 여부
    if (isExistUser) {
      return res
        .status(409)
        .json({ success: false, message: "이미 가입된 이메일입니다." });
    }
    // 패스워드 복호화
    const hashedPassword = await bcrypt.hash(password, 10);
    // 데이터 저장
    const user = await prisma.users.create({
      data: {
        email,
        password: hashedPassword, // 복호화된 비밀번호를 저장합니다.
        name,
        nickname,
        profileImage,
        aboutMe,
        grade,
      },
    });
    return res.status(201).json({ email, name, nickname });
  } catch (error) {
    next(error);
  }
});

// 로그인 API
router.post("/sign-in", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    // 이메일 유무 확인
    if (!email) {
      return res.status(400).json({ message: "이메일을 입력해주세요" });
    }
    // 비밀번호 유무 확인
    if (!password) {
      return res.status(400).json({ message: "비밀번호를 입력해주세요" });
    }
    // 사용자 조회
    const user = await prisma.users.findFirst({ where: { email } });
    // 사용자 존재 여부 확인
    if (!user) {
      return res.status(404).json({ message: "존재하지 않는 이메일입니다." });
    }
    // 비밀번호 일치 여부 확인
    if (!(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "비밀번호가 일치하지 않습니다." });
    }
    // 쿠키 할당 및 출력
    const token = generateAccessToken({ userId: user.userId });
    // const refreshToken = generateRefreshToken({ userId: user.userId });
    res.cookie("authorization", `Bearer ${token}`);
    // res.cookie("refreshToken", `Bearer ${refreshToken}`);
    return res.status(200).json({ message: "로그인에 성공하였습니다." });
  } catch (error) {
    next(error);
  }
});

// 로그아웃 API
router.post("/logout", async (req, res, next) => {
  try {
    // 쿠키를 삭제하여 로그아웃
    res.clearCookie("authorization");
    // res.clearCookie("refreshToken");

    return res.status(200).json({ message: "로그아웃 되었습니다." });
  } catch (error) {
    next(error);
  }
});

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
