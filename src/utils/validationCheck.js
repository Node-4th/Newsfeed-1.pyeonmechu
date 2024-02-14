import { prisma } from "../utils/index.js";

const vcOfPost = async (res, postId) => {
  const post = await prisma.posts.findFirst({
    where: { postId: +postId },
  });

  if (!post)
    return res.status(404).json({ message: "게시글이 존재하지 않습니다." });

  return post;
};

const vcOfComment = async (res, postId, commentId) => {
  const comment = await prisma.comments.findFirst({
    where: { postId: +postId, commentId: +commentId },
  });

  if (!comment)
    return res.status(404).json({ message: "댓글이 존재하지 않습니다." });

  return comment;
};

export { vcOfPost, vcOfComment };
