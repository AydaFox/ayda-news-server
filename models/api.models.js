const fs = require("fs/promises");

exports.selectApi = () => {
    return fs.readFile(`${__dirname}/../endpoints.json`).then((data) => {
        return JSON.parse(data);
    })
}