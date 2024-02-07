import jwt from "jsonwebtoken";

// 초기 payload를 통한 토큰 생성
const generateToken = (payload) => {
  return jwt.sign(payload, process.env.TOKEN_SECRET_KEY, { expiresIn: "12h" });
};
const generateRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.REFRESH_TOKEN_KEY, { expiresIn: "7d" });
};

// 생성된 토큰 유효성 검증 토큰
const verifyToken = (token) => {
  return jwt.verify(token, process.env.TOKEN_SECRET_KEY);
};
const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.REFRESH_TOKEN_KEY);
};

export { generateToken, verifyToken, generateRefreshToken, verifyRefreshToken };
