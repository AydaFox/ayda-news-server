const { selectArticleById } = require("../models/articles.models");
const { selectCommentsByArticleId } = require("../models/comments.models");

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