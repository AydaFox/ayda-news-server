const db = require("../db/connection.js");
const format = require("pg-format");

exports.checkExists = (table, column, value) => {
    const formattedQuery = format(`SELECT * FROM %I WHERE %I = $1;`, table, column);

    return db.query(formattedQuery, [value])
        .then(({ rows }) => {
            if (!rows.length){
                return Promise.reject({ status: 404, msg: `${value} not found` });
            }
        });
}