const { selectArticleById } = require("../models/articles.models");
const { selectCommentsByArticleId, removeComment } = require("../models/comments.models");

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

exports.deleteComment = (req, res, next) => {
    const { comment_id } = req.params;
    removeComment(comment_id).then(() => {
        res.status(204).send();
    })
    .catch(next);
}