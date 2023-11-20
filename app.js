const express = require("express");
const { getTopics } = require("./controllers/topics.controllers");
const { handleServerErrors, handleFourOhFour, handlePsqlErrors, handleCustomErrors } = require("./errors/errors");
const { getArticleById } = require("./controllers/articles.controllers");

const app = express();

app.use(express.json());

app.get("/api/topics", getTopics);

app.get("/api/articles/:article_id", getArticleById);

app.all("*", handleFourOhFour);

app.use(handlePsqlErrors);
app.use(handleCustomErrors);
app.use(handleServerErrors);

module.exports = app;