const commentRouter = require("express").Router();
const { deleteComment } = require("../controllers/comments.controllers");

commentRouter.delete("/:comment_id", deleteComment)

module.exports = commentRouter;