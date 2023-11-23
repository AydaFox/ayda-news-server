const { selectArticles, selectArticleById, updateArticleVotes, selectCommentsByArticleId, insertComment, addArticle, removeArticle } = require("../models/articles.models");
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
        username? checkExists("users", "username", username) : "no username query"
    ];

    Promise.all(promisesArray)
    .then(([comment]) => {
        res.status(201).send({ comment });
    })
    .catch(next);
}

exports.postArticle = (req, res, next) => {
    const { author, title, body, topic, article_img_url } = req.body;

    const promisesArray = [
        author? checkExists("users", "username", author) : "no username author",
        topic? checkExists("topics", "slug", topic) : "no topic query",
    ];

    Promise.all(promisesArray).then(() => {
        return addArticle(author, title, body, topic, article_img_url);
    })
    .then((article) => {
        res.status(201).send({ article });
    })
    .catch(next);
}

exports.deleteArticle = (req, res, next) => {
    const { article_id } = req.params;
    removeArticle(article_id).then(() => {
        res.status(204).send();
    })
    .catch(next);
}