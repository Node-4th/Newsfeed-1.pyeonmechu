export default function (err, req, res, next) {
  console.error(err);
  res.status(500).json({
    success: false,
    message: "잘못된 접근입니다.",
  });
}
