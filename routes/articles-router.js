const articleRouter = require("express").Router();
const { getArticles, getArticleById, patchArticle, getCommentsByArticleId, postCommentToArticle, } = require("../controllers/articles.controllers");

articleRouter.get("/", getArticles);

articleRouter
    .route("/:article_id")
    .get(getArticleById)
    .patch(patchArticle);

articleRouter
    .route("/:article_id/comments")
    .get(getCommentsByArticleId)
    .post(postCommentToArticle);

module.exports = articleRouter;