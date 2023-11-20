const db = require("../db/connection.js");

exports.selectCommentsByArticleId = (article_id) => {
    return db.query(`
        SELECT *
        FROM comments
        WHERE article_id = $1
        ORDER BY created_at DESC`, [article_id])
        .then(({ rows }) => {
            if (!rows.length) {
                return Promise.reject({ status: 404, msg: "article not found" })
            } else {
                return rows;
            }
        })
}