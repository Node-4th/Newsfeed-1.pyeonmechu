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
//import PagesRouter from "./routes/page.router.js";
import dotenv from "dotenv";
// TODO: users 라우터에서 profile Router 따로 만들기, 라우터 모듈화

dotenv.config();

const app = express();
const PORT = 3000;

app.set("view engine", "ejs");
app.set("views", "./src/views");

app.use(Logger);
app.use(express.json());
app.set("view engine", "ejs");
app.set("views", "./src/views");
app.use(cookieParser());

app.get("/main", (req, res) => {
  const data = { id: 1 };
  return res.render("index", { data });
});

app.get("/profile", (req, res) => {
  const data = { id: 1 };
  return res.render("profile", { data });
});

app.get("/profiledetail", (req, res) => {
  const data = { id: 1 };
  return res.render("profiledetail", { data });
});

app.use("/", [
  UsersRouter,
  PostsRouter,
  FollowsRouter,
  CommentsRouter,
  EmailRouter,
  LikesRouter,
  //PagesRouter,
]);
app.use(ErrorHandler);

app.listen(PORT, () => {
  console.log(PORT, "포트로 서버가 열렸어요!");
});
