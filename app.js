const express = require("express");
const { getTopics } = require("./controllers/topics.controllers");
const { handleServerErrors, handleFourOhFour, handlePsqlErrors, handleCustomErrors } = require("./errors/errors");
const { getArticleById } = require("./controllers/articles.controllers");
const { getApi } = require("./controllers/api.controllers");
const { getArticles } = require("./controllers/articles.controllers");

const app = express();

app.get("/api", getApi);

app.get("/api/topics", getTopics);

app.get("/api/articles", getArticles);
app.get("/api/articles/:article_id", getArticleById);

app.post("/api/articles/:article_id/comments")
// update extensions.json
// check prev pull request for error updates
// look into how the dates get added for comments > utils folder!!!

app.all("*", handleFourOhFour);

app.use(handlePsqlErrors);
app.use(handleCustomErrors);
app.use(handleServerErrors);

module.exports = app;