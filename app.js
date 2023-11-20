const express = require("express");
const { getTopics } = require("./controllers/topics.controllers");
const { handleServerErrors, handleFourOhFour } = require("./errors/errors");

const app = express();

app.use(express.json());

app.get("/api/topics", getTopics);

app.all("*", handleFourOhFour);

app.use(handleServerErrors);

module.exports = app;