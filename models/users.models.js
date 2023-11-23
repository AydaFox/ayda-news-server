const db = require("../db/connection.js");

exports.selectUsers = () => {
    return db.query(`SELECT * FROM users;`).then(({ rows }) => {
        return rows;
    });
}

exports.selectUserByUsername = (username) => {
    return db.query(`SELECT * FROM users WHERE username = $1;`, [username]).then(({ rows }) => {
        if (!rows.length) {
            return Promise.reject({ status: 404, msg:"user not found" })
        } else {
            return rows[0];
        }
    });
}