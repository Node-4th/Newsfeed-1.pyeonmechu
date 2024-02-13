import express from "express";
import { prisma } from "../utils/index.js";
import { verifyEmailToken } from "../utils/jwt.js";

const router = express.Router();

router.get("/verify-email/:token", async (req, res, next) => {
  try {
    const token = req.params.token;

    const decodedToken = verifyEmailToken(token);

    await prisma.users.update({
      where: {
        userId: decodedToken.userId,
      },
      data: {
        grade: "USER",
      },
    });

    res.status(200).json({
      message: "이메일 인증이 완료되었습니다. 이제 로그인할 수 있습니다.",
    });
  } catch (error) {
    next(error);
  }
});

export default router;
