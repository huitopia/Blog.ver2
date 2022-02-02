const express = require("express");
const router = express.Router();

const jwt = require("jsonwebtoken");

const User = require("../schemas/user");
const Joi = require("joi");
const bcrypt = require("bcrypt");

const postUsersSchema = Joi.object({
  nickname: Joi.string().alphanum().min(4).max(30).required(),
  password: Joi.string().pattern(new RegExp("^[a-zA-Z0-9]{4,30}$")).required(),
  passwordConfirm: Joi.string().required(),
});

// 회원가입
router.post("/signup", async (req, res) => {
  try {
    const recentUser = await User.find().sort("-userId").limit(1);
    let userId = 1;
    if (recentUser.length != 0) {
      userId = recentUser[0]["userId"] + 1;
    }
    const { nickname, password, passwordConfirm } =
      await postUsersSchema.validateAsync(req.body);
    if (nickname === password) {
      res.status(400).send({
        errorMessage: "아이디, 비밀번호가 같습니다",
      });
      return;
    }

    const nic = await User.find({ nickname: nickname });
    if (nic.length !== 0) {
      res.status(400).send({
        errorMessage: "닉네임이 중복되었습니다",
      });
      return;
    } else if (password !== passwordConfirm) {
      res.status(400).send({
        errorMessage: "비밀번호가 서로 맞지 않습니다",
      });
      return;
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
    await User.create({ userId, nickname, hashedPassword });

    res.status(201).send({
      result: "success",
    });
  } catch (err) {
    res.status(400).send({
      errorMessage: "아이디, 비밀번호를 최소 4자 이상 입력해 주세요",
    });
  }
});

// 로그인 쪽 검증 - Joi 사용
const postAuthSchema = Joi.object({
  // email: Joi.string().email().required(),
  nickname: Joi.string().required(),
  password: Joi.string().required(),
});

// 로그인
router.post("/login", async (req, res) => {
  // try {
  const { nickname, password } = await postAuthSchema.validateAsync(req.body);
  const user = await User.findOne({ nickname }).exec();
  if (!user) {
    res.status(400).send({
      errorMessage: "이메일 또는 패스워드가 틀렸어",
    });
    return;
  }

  const authenticate = await bcrypt.compare(password, user.hashedPassword);
  if (authenticate === true) {
    const token = jwt.sign({ userId: user.userId }, "my-secret-key");
    res.send({
      token,
    });
  } else {
    res.status(401).send({
      message: "ID나 비밀번호가 잘못됐습니다.",
    });
    return;
  }
});

module.exports = router;
