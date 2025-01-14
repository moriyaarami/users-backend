const { logRequest } = require("../logFunction");
const { User } = require("../schema/users");

module.exports = async (req, res, next) => {
    console.log(req.user._id)

    const user = await User.findById(req.user._id);


    if (!user) {
        logRequest(401, "not found user with is id.")
        return res.status(401).send("not found user with is id.");
    }
    const user_id = req.user._id;
    const paramId = req.params.id;

    if (user_id != paramId) {
        logRequest(401, "you do not have permission to perform this action")
        return res.status(401).send("you do not have permission to perform this action");
    }
    req.user = user;
    next();

}