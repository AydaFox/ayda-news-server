const db = require("../db/connection.js");

exports.selectArticles = (topic, sort_by) => {
    
    const validSorts = [ "article_id", "title", "topic", "author", "created_at", "votes" ];
    if (sort_by && !validSorts.includes(sort_by)) {
        return Promise.reject({});
    }

    let queryString = `
            SELECT 
                articles.article_id, 
                articles.title, 
                articles.topic,
                articles.author,
                articles.created_at, 
                articles.votes, 
                articles.article_img_url, 
                COUNT(comments.comment_id) AS comment_count
            FROM articles
            LEFT JOIN comments ON articles.article_id = comments.article_id `
    
    if (topic) {
        queryString += `WHERE topic = '${topic}' `
    }

    queryString += `GROUP BY articles.article_id
                    ORDER BY articles.${sort_by || "created_at"} DESC;`

    return db.query(queryString)
        .then(({ rows }) => {
            return rows;
        })
}

exports.selectArticleById = (article_id) => {
    return db.query(`
        SELECT 
            articles.article_id, 
            articles.title, 
            articles.topic, 
            articles.author, 
            articles.body, 
            articles.created_at, 
            articles.votes, 
            articles.article_img_url, 
            COUNT(comments.comment_id) AS comment_count
        FROM articles
        LEFT JOIN comments ON articles.article_id = comments.article_id
        WHERE articles.article_id = $1
        GROUP BY articles.article_id;`, [article_id]).then(({ rows }) => {
            if (!rows.length) {
                return Promise.reject({ status: 404, msg: "article not found" });
            } else {
                return rows[0];
            }
        })
}

exports.updateArticleVotes = (article_id, inc_votes) => {
    if (!inc_votes) {
        return Promise.reject({ status: 400, msg: "bad request" })
    }
    return db.query(`
            UPDATE articles
            SET votes = votes + $1
            WHERE article_id = $2
            RETURNING *;`, [inc_votes, article_id])
        .then(({ rows }) => {
            if (!rows.length) {
                return Promise.reject({ status: 404, msg: "article not found" });
            } else {
                return rows[0];
            }
        })
}
