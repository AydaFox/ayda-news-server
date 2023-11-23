const articleRouter = require("express").Router();
const { getArticles, getArticleById, patchArticle } = require("../controllers/articles.controllers");
const { getCommentsByArticleId, postComment } = require("../controllers/comments.controllers");

articleRouter.get("/", getArticles);

articleRouter
    .route("/:article_id")
    .get(getArticleById)
    .patch(patchArticle);

articleRouter
    .route("/:article_id/comments")
    .get(getCommentsByArticleId)
    .post(postComment);

module.exports = articleRouter;