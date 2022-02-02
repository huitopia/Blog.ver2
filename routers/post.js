const express = require("express");
const router = express.Router();

const url = require("url");
const Post = require("../schemas/post");
const Comment = require("../schemas/comment");
const authMiddleware = require("../middlewares/middlewares");

router.get("/post", async (req, res, next) => {
  try {
    const post = await Post.find({}).sort("-postId");
    res.json({ post: post });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.post("/post", async (req, res) => {
  const recentPost = await Post.find().sort("-postId").limit(1);
  let postId = 1;
  if (recentPost.length != 0) {
    postId = recentPost[0]["postId"] + 1;
  }
  console.log(req.body);
  console.log(postId);
  const { title, description, author } = req.body;

  const date = new Date().format("yyyy-MM-dd a/p hh:mm:ss");
  await Post.create({ postId, title, description, date, author });
  res.send({ result: "success" });
});

router.get("/post/:postId", async (req, res, next) => {
  try {
    const { postId } = req.params;
    const post = await Post.findOne({ postId });
    res.json({ post: post });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.put("/post/:postId", authMiddleware, async (req, res) => {
  const { user } = res.locals;
  const { postId } = req.params;
  const { title, description } = req.body;
  const tokenNickname = user["nickname"];
  const p = await Post.findOne({ postId });
  const dbNickname = p["author"];

  if (tokenNickname == dbNickname) {
    await Post.updateOne({ postId }, { $set: { title, description } });
    res.send({ result: "success" });
  } else {
    res.send({ result: "혼날래?" });
  }
});

router.delete("/post/:postId", authMiddleware, async (req, res) => {
  const { user } = res.locals;
  const { postId } = req.params;
  const tokenNickname = user["nickname"];
  const p = await Post.findOne({ postId });
  const dbNickname = p["author"];
  const commentDelete = await Comment.find({ postId });
  if (tokenNickname == dbNickname) {
    await Post.deleteOne({ postId });
    await Comment.deleteMany({ postId });
    res.send({ result: "success" });
  } else {
    res.send({ result: "당신에게는 권한이 없습니다!서버" });
  }
});

module.exports = router;
