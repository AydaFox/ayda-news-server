const { selectArticleById } = require("../models/articles.models");
const { selectCommentsByArticleId, insertComment } = require("../models/comments.models");

exports.getCommentsByArticleId = (req, res, next) => {
    const { article_id } = req.params;

    const promisesArray = [ 
        selectCommentsByArticleId(article_id), 
        selectArticleById(article_id)
    ];

    Promise.all(promisesArray).then(([comments]) => {
        res.status(200).send({ comments });
    })
    .catch(next);
}

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