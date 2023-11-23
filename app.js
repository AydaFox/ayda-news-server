const express = require("express");
const apiRouter = require("./routes/api-router");
const { handleServerErrors, handleFourOhFour, handlePsqlErrors, handleCustomErrors } = require("./errors/errors");

const app = express();

app.use(express.json());

app.use("/api", apiRouter);

app.all("*", handleFourOhFour);
app.use(handlePsqlErrors);
app.use(handleCustomErrors);
app.use(handleServerErrors);

module.exports = app;