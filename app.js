const express = require("express");
const app = express();
const port = 3000;
const connect = require("./schemas");
connect();
const middleware = require("./middlewares/middlewares")
const PostRouter = require("./routers/post");
const CommentRouter = require("./routers/comment");
const UserRouter = require("./routers/user");
// const { swaggerUi, specs } = require('./swagger/swagger');
// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static("public"));

app.use("/api", [PostRouter]);
app.use("/api", [CommentRouter]);
app.use("/api", [UserRouter]);
app.set("views", __dirname + "/views");
app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/post", (req, res) => {
  res.render("post");
});

app.get("/detail/:postId", (req, res) => {
  let id = req.params.postId
  res.render("detail", {id});
});

app.get("/update/:postId", (req, res) => {
  let id = req.params.postId
  res.render("update", {id});
});

app.get("/signup", (req, res) => {
  res.render("signup");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/api/users/me", middleware, async (req, res) => {
  const { user } = res.locals
  res.send({
    user,
  })
})

app.listen(port, () => {
  console.log(`listening at http://localhost:${port}`);
});