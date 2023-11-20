const express = require("express");
const { getTopics } = require("./controllers/topics.controllers");
const { handleServerErrors, handleFourOhFour } = require("./errors/errors");
const { getApi } = require("./controllers/api.controllers");
const { getArticles } = require("./controllers/articles.controllers");

const app = express();

app.use(express.json());

app.get("/api", getApi);

app.get("/api/topics", getTopics);

app.get("/api/articles", getArticles);

app.all("*", handleFourOhFour);

app.use(handleServerErrors);

module.exports = app;