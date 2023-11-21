const { selectArticleById } = require("../models/articles.models");
const { insertComment } = require("../models/comments.models");

exports.postComment = (req, res, next) => {
    const { username, body} = req.body;
    const { article_id } = req.params;

    selectArticleById(article_id).then(() => {
        return insertComment(username, body, article_id)
    })
    .then((comment) => {
        res.status(201).send({ comment });
    })
    .catch(next);
}