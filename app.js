const express = require("express");
const { getTopics } = require("./controllers/topics.controllers");
const { handleServerErrors, handleFourOhFour, handlePsqlErrors, handleCustomErrors } = require("./errors/errors");
const { getArticleById, getArticles, patchArticle } = require("./controllers/articles.controllers");
const { getApi } = require("./controllers/api.controllers");
const { getCommentsByArticleId, postComment, deleteComment } = require("./controllers/comments.controllers");
const { getUsers } = require("./controllers/users.controllers");

const app = express();

app.use(express.json());

app.get("/api", getApi);

app.get("/api/topics", getTopics);

app.get("/api/articles", getArticles);

app.get("/api/articles/:article_id", getArticleById);
app.patch("/api/articles/:article_id", patchArticle);

app.get("/api/articles/:article_id/comments", getCommentsByArticleId);
app.post("/api/articles/:article_id/comments", postComment);

app.delete("/api/comments/:comment_id", deleteComment);

app.get("/api/users", getUsers);

app.all("*", handleFourOhFour);

app.use(handlePsqlErrors);
app.use(handleCustomErrors);
app.use(handleServerErrors);

module.exports = app;