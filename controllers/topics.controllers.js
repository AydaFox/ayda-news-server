const { seletTopics } = require("../models/topics.models");

exports.getTopics = (req, res, next) => {
    seletTopics().then((topics) => {
        res.status(200).send({ topics });
    })
    .catch(next);
}
