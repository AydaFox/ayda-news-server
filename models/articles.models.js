const db = require("../db/connection.js");

exports.selectArticles = (topic, sort_by, order, limit = 10, page = 1) => {
    const validSorts = [ "article_id", "title", "topic", "author", "created_at", "votes" ];
    const validOrder = [ "asc", "desc" ];
    const validDigit = /^\d+$/;
    if (
        sort_by && !validSorts.includes(sort_by) || 
        order && !validOrder.includes(order) || 
        limit && !validDigit.test(limit) || 
        page && !validDigit.test(page)
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
    
    let topicString = ""
    if (topic) {
        topicString += `WHERE topic = '${topic}' `;
    }
    queryString += topicString;

    const offset = limit * (page-1);

    queryString += `GROUP BY articles.article_id
                    ORDER BY articles.${sort_by || "created_at"} ${order || "DESC"}
                    LIMIT ${limit} 
                    OFFSET ${offset};`;
    
    return db.query(queryString)
        .then(({ rows }) => {
            const total_count = db.query(`SELECT * FROM articles ${topicString};`);
            return Promise.all([rows, total_count]);
        })
        .then(( [articles, total_count] ) => {
            if (total_count.rows.length < offset) {
                return Promise.reject({ status: 404, msg: "articles not found" });
            } else {
                return [articles, total_count.rows.length ];
            }
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

exports.selectCommentsByArticleId = (article_id, limit = 10, page = 1) => {
    const validDigit = /^\d+$/;
    if (!validDigit.test(limit) || !validDigit.test(page)) {
        return Promise.reject({ status: 400, msg: "bad request" });
    }

    const offset = limit * (page-1);

    let queryString = `
            SELECT *
            FROM comments
            WHERE article_id = $1
            ORDER BY created_at DESC
            LIMIT $2
            OFFSET ${offset};`;

    return db.query(`SELECT COUNT(comment_id) AS total_count 
                    FROM comments WHERE article_id = $1;`, [article_id])
                .then(({ rows }) => {
                    total_comments = rows[0].total_count;
                    if (total_comments && total_comments < offset) {
                        return Promise.reject({ status: 404, msg: "comments not found" });
                    } else {
                        return db.query(queryString, [article_id, limit])
                    }
                })
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

exports.removeArticle = (article_id) => {
    return db.query(`DELETE FROM articles WHERE article_id = $1 RETURNING *;`, [article_id])
        .then(({ rows }) => {
            if (!rows.length) {
                return Promise.reject({ status: 404, msg: "article not found" });
            }
        });
}