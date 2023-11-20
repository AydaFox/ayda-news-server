

exports.handleFourOhFour = (req, res, next) => {
    res.status(404).send({ msg: "path not found" });
}

exports.handleServerErrors = (err, req, res, next) => {
    res.status(500).send({ msg: "internal server error" });
}