const articleRouter = require("express").Router();
const { getArticles, getArticleById, patchArticle, getCommentsByArticleId, postCommentToArticle, postArticle, } = require("../controllers/articles.controllers");

articleRouter
    .route("/")
    .get(getArticles)
    .post(postArticle);

articleRouter
    .route("/:article_id")
    .get(getArticleById)
    .patch(patchArticle);

articleRouter
    .route("/:article_id/comments")
    .get(getCommentsByArticleId)
    .post(postCommentToArticle);

module.exports = articleRouter;