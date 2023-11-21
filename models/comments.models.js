const db = require("../db/connection.js");
const format = require("pg-format");

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

exports.checkExists = (table, column, value) => {
    const formattedQuery = format(`SELECT * FROM %I WHERE %I = $1;`, table, column);

    return db.query(formattedQuery, [value])
        .then(({ rows }) => {
            if (!rows.length){
                return Promise.reject({ status: 404, msg: `${value} not found` });
            }
        });
}

exports.removeComment = (comment_id) => {
    return db.query(`
            DELETE FROM comments 
            WHERE comment_id = $1
            RETURNING *;`, [comment_id])
        .then(({ rows }) => {
            if (!rows.length) {
                return Promise.reject({ status: 404, msg: "comment not found" });
            }
        });
}