const db = require("../db/connection.js");

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

exports.updateCommentVotes = (inc_votes, comment_id) => {
    if (!inc_votes) {
        return Promise.reject({ status: 400, msg: "bad request" })
    }
    return db.query(`
            UPDATE comments
            SET votes = votes + $1
            WHERE comment_id = $2
            RETURNING *;`, [inc_votes, comment_id]).then(({ rows }) => {
                if (!rows.length) {
                    return Promise.reject({ status: 404, msg: "comment not found" });
                } else {
                    return rows[0];
                }
            });
}