const express = require("express");
const router = express.Router();

const Comment = require("../schemas/comment");
const authMiddleware = require("../middlewares/middlewares");

router.post("/comment", authMiddleware, async (req, res) => {
  const { postId } = req.body;
  const { user } = res.locals;
  const author = user["nickname"];

  const recentComment = await Comment.find().sort("-commentId").limit(1);

  let commentId = 1;
  if (recentComment.length != 0) {
    commentId = recentComment[0]["commentId"] + 1;
  }
  const { description } = req.body;

  const date = new Date().format("yyyy-MM-dd a/p hh:mm:ss");
  await Comment.create({ commentId, postId, description, date, author });
  res.send({ result: "success" });
});

router.get("/comment/:postId", async (req, res, next) => {
  const { postId } = req.params;
  const comment = await Comment.find({ postId }).sort("-commentId");
  res.json({ comment: comment });
});

router.delete("/comment", authMiddleware, async (req, res) => {
  const { user } = res.locals;
  const { commentId } = req.body;

  const tokenNickname = user["nickname"];
  const p = await Comment.findOne({ commentId });
  const dbNickname = p["author"];

  if (tokenNickname === dbNickname) {
    await Comment.deleteOne({ commentId });
    res.send({ result: "success" });
  } else {
    res.send({ result: "당신에게는 권한이 없습니다!서버" });
  }
});

router.put("/comment", authMiddleware, async (req, res) => {
  const { user } = res.locals;
  const { commentId, description } = req.body;

  const tokenNickname = user["nickname"];
  const p = await Comment.findOne({ commentId });
  const dbNickname = p["author"];

  if (tokenNickname === dbNickname) {
    await Comment.updateOne({ commentId }, { $set: { description } });
    res.send({ result: "success" });
  } else {
    res.send({ result: "혼날래?" });
  }
});

module.exports = router;
