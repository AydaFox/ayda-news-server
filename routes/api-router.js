const apiRouter = require("express").Router();
const { getApi } = require("../controllers/api.controllers");
const articleRouter = require("./articles-router");
const commentRouter = require("./comments-router");
const topicRouter = require("./topics-router");
const userRouter = require("./users-router");

apiRouter.get("/", getApi);

apiRouter.use("/articles", articleRouter);

apiRouter.use("/comments", commentRouter);

apiRouter.use("/topics", topicRouter);

apiRouter.use("/users", userRouter);

module.exports = apiRouter;