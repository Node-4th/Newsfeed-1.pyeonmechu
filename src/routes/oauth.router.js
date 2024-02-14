import express from "express";

const router = express.Router();

const getKauthCode = (req, res, next) => {
  const baseUrl = "https://kauth.kakao.com/oauth/authorize";
  const params = {
    client_id: process.env.KAKAO_REST_API_KEY,
    redirect_uri: process.env.KAKAO_REDIRECT_URL,
    response_type: "code",
  };

  const getUrl = baseUrl + "?" + new URLSearchParams(params).toString();

  return res.redirect(getUrl);
};

const getKauthToken = (req, res) => {
  const baseUrl = "https://kauth.kakao.com/oauth/token";
  const params = {
    grant_type: "authorization_code",
    client_id: process.env.KAKAO_REST_API_KEY,
    redirect_uri: process.env.KAKAO_REDIRECT_URL, // 인가 코드가 리다이렉트된 url
    code: 1, // 인가 코드 받기 요청으로 얻은 인가 코드
  };
};

router.get("/kakao", getKauthCode);

router.get("/kakao/getCode", (req, res, next) => {
  const { code, error, error_description, state } = req.query;
  if (error) {
    return res.status(400).json({ error: error + ": " + error_description });
  }

  return res.status(200).json({ code, state });
});

export default router;
