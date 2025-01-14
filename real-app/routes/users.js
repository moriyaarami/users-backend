const express = require('express');
const jwt = require("jsonwebtoken");
const config = require('../config/config')
const _ = require('lodash')
const bcrypt = require('bcrypt')
const { User, validateUser, validateLoginUser, validateUpdateUser } = require("../schema/users");
const authMW = require("../middleware/auth");
const registeredUser = require('../middleware/registered');
const { logRequest } = require('../logs/functions')

const router = express.Router();

/* register user (everyone)*/
router.post('/', async (req, res) => {
    /* validate user input */
    const { error } = validateUser(req.body);
    if (error) {
        res.status(400).send(error.details[0].message);
        logRequest(400, error.details[0].message)
        return;
    }

    /* validate system */
    let user = await User.findOne({ email: req.body.email });
    if (user) {
        res.status(400).send('User already exists.');
        logRequest(400, 'User already exists.')
        return;
    }

    /* create user */
    user = await new User(req.body);
    user.password = await bcrypt.hash(user.password, 12);

    await user.save();


    /* send */
    res.json(user);
});
/* login (everyone) */
router.post('/login', async (req, res) => {
    const { error } = validateLoginUser(req.body);
    if (error) {
        res.status(400).send(error.details[0].message);
        logRequest(400, error.details[0].message)
        return;
    };
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        res.status(400).send('Invalid email or password.');
        logRequest(400, "Invalid email or password")
        return;
    }

    const validatePassword = await bcrypt.compare(req.body.password, user.password);

    if (!validatePassword) {
        res.status(400).send('Invalid email or password.');
        logRequest(400, "Invalid email or password")
        return;
    }

    const token = jwt.sign({ _id: user._id, admin: user.isAdmin, biz: user.isBusiness }, config.jwtKey);
    res.json({ token });

});
/* get all users (just admin user) */
router.get('/', authMW, async (req, res) => {

    const adminUser = req.user.admin;
    if (adminUser) {
        const users = await User.find();

        if (users.length == 0) {
            res.status(404).send('No users found.');
            logRequest(404, "No users found.")
            return;
        }
        const usersWithLimitedFields = users.map(user =>
            _.pick(user, ["_id", "name", "email", "phone", "isAdmin", "isBusiness"]));

        res.json(usersWithLimitedFields)
        return;


    }
    logRequest(401, "just admin user can get the users information")
    res.status(401).send('just admin user can get the users information');
});
/* get user by id */
router.get('/:id', authMW, async (req, res) => {
    const adminUser = req.user.admin;
    const registeredUser = req.params.id === req.user._id ? true : false;

    if (adminUser || registeredUser) {
        const user = await User.findById(req.params.id);
        if (!user) {
            res.status(404).send('User not found.');
            logRequest(404, "User not found.")
            return;
        }
        res.send(_.pick(user, ["_id", "name", "email", "phone", "isAdmin", "isBusiness"]));
        return;
    }
    logRequest(400, "just admin user or registered user can get the user information")
    res.status(400).send("just admin user or registered user can get the user information");
})
/* edit user (just registered user) */
router.put('/:id', authMW, registeredUser, async (req, res) => {
    try {
        const { error } = validateUpdateUser(req.body);
        if (error) {
            res.status(400).send(error.details[0].message);
            logRequest(400, error.details[0].message)
            return;
        }

        if (Object.keys(req.body).length === 0) {
            res.status(400).send("please provide the update details");
            logRequest(400, "please provide the update details")
            return;
        }

        if (req.body.password) {
            req.body.password = await bcrypt.hash(req.body.password, 12);
        }

        let user = await User.findByIdAndUpdate(
            req.params.id,
            req.body,
            { returnDocument: "after" }
        );

        res.send(user)


    } catch (err) {
        res.status(500).send(err.message);
        logRequest(500, err.message)
    }

});
/* change isBusiness status */
router.patch('/:id', authMW, registeredUser, async (req, res) => {
    const user = req.user;

    user.isBusiness = !user.isBusiness;

    await user.save();
    res.send(_.pick(user, ["_id", "name", "email", "phone", "isAdmin", "isBusiness"]));

})
router.delete('/:id', authMW, async (req, res) => {
    const adminUser = req.user.admin;
    const registeredUser = req.params.id === req.user._id ? true : false;

    if (adminUser || registeredUser) {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            res.status(404).send('No user found with this id.');
            logRequest(404, "No user found with this id.")
            return;
        }
        res.send(`the user:${user} deleted successfully.`);
        return;
    }
    logRequest(400, "just admin user or registered user can delete the user")
    res.status(400).send("just admin user or registered user can delete the user");

})

module.exports = router;