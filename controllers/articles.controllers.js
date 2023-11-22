const { selectArticles, selectArticleById, updateArticleVotes } = require("../models/articles.models");
const { checkExists } = require("../models/comments.models");

exports.getArticles = (req, res, next) => {
    const { topic, sort_by } = req.query;

    const promisesArray = [
        topic? checkExists("topics", "slug", topic) : "no topic query",
    ];

    Promise.all(promisesArray)
    .then(() => {
        return selectArticles(topic, sort_by);
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