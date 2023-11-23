const db = require("../db/connection.js");

exports.seletTopics = () => {
    return db.query(`SELECT * FROM topics;`).then(({ rows }) => {
        return rows;
    })
}

exports.addTopic = ({ slug, description }) => {
    const values = [slug, description];
    if (values.includes(undefined)){
        return Promise.reject({ status: 400, msg: "bad request"})
    }
    return db.query(`
            INSERT INTO topics
                (slug, description)
            VALUES
                ($1, $2)
            RETURNING *;`, values).then(({ rows }) => {
                return rows[0];
            });
}