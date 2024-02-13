import express from "express";

const router = express.Router();

router.get("/sign-up", (req, res, next) => {
  res.render("sign-up");
});
export default router;
