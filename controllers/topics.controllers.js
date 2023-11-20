const { seletTopics } = require("../models/topics.models");

exports.getTopics = (req, res, next) => {
    seletTopics().then((topics) => {
        res.status(200).send({ topics });
    });
}

exports.handleFourOhFour = (req, res, next) => {
    res.status(404).send({ msg: "path not found" });
}