import { verifyAccessToken } from "../utils/jwt.js";
import { prisma } from "../utils/index.js";

export default async function (req, res, next) {
  try {
    // 쿠키에 토큰을 저장
    const { authorization } = req.cookies;
    if (!authorization) throw new Error("존재하지 않는 사용자 입니다.");

    // 토큰 타입을 bearer 형식으로 변환
    const [tokenType, token] = authorization.split(" ");
    if (tokenType !== "Bearer")
      throw new Error("토큰 타입이 Bearer 형식이 아닙니다.");

    const decodedToken = verifyAccessToken(token);
    const userId = decodedToken.userId;

    const user = await prisma.users.findFirst({
      where: { userId: +userId },
    });
    if (!user) throw new Error("토큰 사용자가 존재하지 않습니다.");

    req.user = user;

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError")
      return res
        .status(401)
        .json({ success: false, message: "토큰이 만료되었습니다." });
    if (error.name === "JsonWebTokenError")
      return res
        .status(401)
        .json({ success: false, message: "토큰이 조작되었습니다." });
    return res.status(400).json({ success: false, message: error.message });
  }
}
