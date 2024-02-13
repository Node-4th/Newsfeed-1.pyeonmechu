import express from "express";
import cookieParser from "cookie-parser";
import ErrorHandler from "./middlewares/error-handler.middleware.js";
import Logger from "./middlewares/logger.middleware.js";
import UsersRouter from "./routes/users.router.js";
import PostsRouter from "./routes/posts.router.js";
import CommentsRouter from "./routes/comments.router.js";
import EmailRouter from "./routes/email.router.js";
import FollowsRouter from "./routes/follows.router.js";
import LikesRouter from "./routes/likes.router.js";
import NewsfeedRouter from "./routes/newsfeed.router.js";
import dotenv from "dotenv";
// TODO: users 라우터에서 profile Router 따로 만들기, 라우터 모듈화

dotenv.config();

const app = express();
const PORT = 3000;

app.use(Logger);
app.use(express.json());
app.use(cookieParser());

app.use("/", [
  UsersRouter,
  NewsfeedRouter,
  PostsRouter,
  FollowsRouter,
  CommentsRouter,
  EmailRouter,
  LikesRouter,
]);
app.use(ErrorHandler);

app.listen(PORT, () => {
  console.log(PORT, "포트로 서버가 열렸어요!");
});
