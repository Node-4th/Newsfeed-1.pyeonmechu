import express from "express";
import cookieParser from "cookie-parser";
import ErrorHandler from "./middlewares/error-handler.middleware.js";
import Logger from "./middlewares/logger.middleware.js";
import UsersRouter from "./routes/users.router.js";
import PostsRouter from "./routes/posts.router.js";
import CommentsRouter from "./routes/comments.router.js";
import FollowRouter from "./routes/follow.router.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(Logger);
app.use(express.json());
app.use(cookieParser());

app.use("/", [UsersRouter, PostsRouter, FollowRouter, CommentsRouter]);
app.use(ErrorHandler);

app.listen(PORT, () => {
  console.log(PORT, "포트로 서버가 열렸어요!");
});
