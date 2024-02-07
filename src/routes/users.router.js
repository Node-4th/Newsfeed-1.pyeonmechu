import express from "express";
import { prisma } from "../utils/index.js";
import bcrypt from "bcrypt";
import { generateToken, generateRefreshToken } from "../utils/jwt.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

// 회원가입 API
router.post("/sign-up", async (req, res, next) => {
  try {
    const {
      email,
      password,
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
        .status(404)
        .json({ success: false, message: "이메일을 입력해주세요" }); // 404 - Not Found (찾을 수 없음)
    }
    // 비밀번호 존재 유무
    if (!password) {
      return res
        .status(404)
        .json({ success: false, message: "비밀번호를 입력해주세요" }); // 404 - Not Found (찾을 수 없음)
    }
    // 비밀번호의 길이
    if (password.length < 6) {
      return res
        .status(400)
        .json({ success: false, message: "비밀번호는 최소 6자리 이상입니다." }); // 400 - Bad Request (잘못된요청)
    }
    // 이름 존재 유무
    if (!name) {
      return res
        .status(404)
        .json({ success: false, message: "이름을 입력해주세요" }); // 404 - Not Found (찾을 수 없음)
    }
    // 닉네임 존재 유무
    if (!nickname) {
      return res
        .status(404)
        .json({ success: false, message: "닉네임을 입력해주세요." }); // 404 - Not Found (찾을 수 없음)
    }
    // // 프로필이미지 존재 유무
    // if (!profileImage) {
    //   return res
    //     .status(404)
    //     .json({ success: false, message: "프로필 이미지를 등록해주세요." }); // 404 - Not Found (찾을 수 없음)
    // }
    // // 자기소개 존재 유무
    // if (!aboutMe) {
    //   return res
    //     .status(404)
    //     .json({ success: false, message: "자기소개를 작성해주세요." }); // 404 - Not Found (찾을 수 없음)
    // }
    // 이메일 확인
    const isExisUser = await prisma.users.findFirst({
      where: { email },
    });
    // 이메일 중복 여부
    if (isExisUser) {
      return res
        .status(400)
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
      return res.status(404).json({ message: "이메일을 입력해주세요" });
    }
    // 비밀번호 유무 확인
    if (!password) {
      return res.status(404).json({ message: "비밀번호를 입력해주세요" });
    }
    // 사용자 조회
    const user = await prisma.users.findFirst({ where: { email } });
    // 사용자 존재 여부 확인
    if (!user) {
      return res.status(404).json({ message: "존재하지 않는 이메일입니다." });
    }
    // 비밀번호 일치 여부 확인
    if (!(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: "비밀번호가 일치하지 않습니다." });
    }
    // 쿠키 할당 및 출력
    const token = generateToken({ userId: user.userId });
    const refreshToken = generateRefreshToken({ userId: user.userId });
    res.cookie("authorization", `Bearer ${token}`);
    res.cookie("refreshToken", `Bearer ${refreshToken}`);
    return res.status(200).json({ message: "로그인에 성공하였습니다." });
  } catch (error) {
    next(error);
  }
});
// 로그아웃 API

export default router;
