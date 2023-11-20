const db = require("../db/connection.js");

exports.seletTopics = () => {
    return db.query(`SELECT * FROM topics;`).then(({ rows }) => {
        return rows;
    })
}