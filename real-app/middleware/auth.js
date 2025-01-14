const jwt = require("jsonwebtoken");
const config = require("../config/config");
const { logRequest } = require("../logs/functions");

module.exports = (req, res, next) => {
    const token = req.header("x-auth-token");
    if (!token) {
        logRequest(401, "Invalid token");
        return res.status(401).json({ message: "Invalid token." });
    }

    try {
        const playload = jwt.verify(token, config.jwtKey);
        req.user = playload;
        next();
    } catch {
        logRequest(400, "Invalid token");
        res.status(400).send("Invalid token.")
    }
}