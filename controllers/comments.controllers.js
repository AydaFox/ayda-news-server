const { selectArticleById } = require("../models/articles.models");
const { selectCommentsByArticleId, insertComment, removeComment } = require("../models/comments.models");
const { checkExists } = require("../models/utils.models");

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

    const promisesArray = [
        selectArticleById(article_id).then(() => {
            return insertComment(username, body, article_id)
        }),
        checkExists("users", "username", username)
    ];

    Promise.all(promisesArray)
    .then(([comment]) => {
        res.status(201).send({ comment });
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