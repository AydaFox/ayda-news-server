

exports.handleFourOhFour = (req, res, next) => {
    res.status(404).send({ msg: "path not found" });
}

exports.handleServerErrors = (err, req, res, next) => {
    console.log(err);
    res.status(500).send({ msg: "internal server error" });
}

exports.handlePsqlErrors = (err, req, res, next) => {
    switch(err.code){
        case "22P02":
        case "42601":
            res.status(400).send({ msg: "bad request" });
            break;
        default:
            next(err);
            break;
    }
}

exports.handleCustomErrors = (err, req, res, next) => {
    if (err.status) {
        res.status(err.status).send({ msg: err.msg });
    } else {
        next(err);
    }
}