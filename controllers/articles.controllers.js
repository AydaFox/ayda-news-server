const { selectArticles, selectArticleById, updateArticleVotes, selectCommentsByArticleId, insertComment } = require("../models/articles.models");
const { checkExists } = require("../models/utils.models");

exports.getArticles = (req, res, next) => {
    const { topic, sort_by, order } = req.query;

    const promisesArray = [
        topic? checkExists("topics", "slug", topic) : "no topic query",
    ];

    Promise.all(promisesArray)
    .then(() => {
        return selectArticles(topic, sort_by, order);
    })
    .then((articles) => {
        res.status(200).send({ articles });
    })
    .catch(next);
}

exports.getArticleById = (req, res, next) => {
    const { article_id } = req.params;
    selectArticleById(article_id).then(( article ) => {
        res.status(200).send({ article });
    })
    .catch(next);
}

exports.patchArticle = (req, res, next) => {
    const { article_id } = req.params;
    const { inc_votes } = req.body;
    updateArticleVotes(article_id, inc_votes).then((article) => {
        res.status(200).send({ article });
    })
    .catch(next);
}

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

exports.postCommentToArticle = (req, res, next) => {
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