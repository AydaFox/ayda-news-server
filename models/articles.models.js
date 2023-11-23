const db = require("../db/connection.js");

exports.selectArticles = (topic, sort_by, order) => {
    const validSorts = [ "article_id", "title", "topic", "author", "created_at", "votes" ];
    const validOrder = [ "asc", "desc" ];
    if (
        sort_by && !validSorts.includes(sort_by) || 
        order && !validOrder.includes(order)
        ) {
        return Promise.reject({ status: 400, msg: "bad request" });
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
            LEFT JOIN comments ON articles.article_id = comments.article_id `;
    
    if (topic) {
        queryString += `WHERE topic = '${topic}' `;
    }

    queryString += `GROUP BY articles.article_id
                    ORDER BY articles.${sort_by || "created_at"} ${order || "DESC"};`;

    return db.query(queryString)
        .then(({ rows }) => {
            return rows;
        });
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

exports.insertComment = (author, body, article_id) => {
    if (!author || !body) {
        return Promise.reject({ status: 400, msg: "bad request" });
    }
    const newComment = [0, new Date, author, body, article_id];
    return db.query(`
            INSERT INTO comments
                (votes, created_at, author, body, article_id)
            VALUES
                ($1, $2, $3, $4, $5)
            RETURNING *;`, newComment)
        .then(({ rows }) => {
            return rows[0];
        });
}

exports.selectCommentsByArticleId = (article_id) => {
    return db.query(`
            SELECT *
            FROM comments
            WHERE article_id = $1
            ORDER BY created_at DESC;`, [article_id])
        .then(({ rows }) => {
            return rows;
        });
}

exports.addArticle = (author, title, body, topic, article_img_url) => {
    const values = [
        title,
        topic,
        author,
        body,
        0,
        article_img_url,
    ];
    let column = ", article_img_url";
    let value = ", $6";

    if (!article_img_url) {
        column = "";
        value = "";
        values.pop();
    }
    
    return db.query(`
            INSERT INTO articles
                (title, topic, author, body, votes${column})
            VALUES
                ($1, $2, $3, $4, $5${value})
            RETURNING *;`, values).then(({ rows }) => {
                rows[0].comment_count = 0;
                return rows[0];
            });
}