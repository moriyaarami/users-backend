const express = require('express');

const { Card, validateCard, generateBizNumber } = require("../schema/cards");

const { User } = require("../schema/users")
const authMW = require('../middleware/auth');
const { object } = require('joi');
const { logRequest } = require('../logs/functions');

const router = express.Router();

router.get('/', async (req, res) => {
    const cards = await Card.find();
    if (!cards) {
        logRequest(404, 'No cards found');
        res.status(404).send('No cards found.');
        return;
    }
    res.send(cards);
    return;
})

router.get('/my-cards', authMW, async (req, res) => {
    const cards = await Card.find({ user_id: req.user._id });

    if (cards.length === 0) {
        logRequest(404, 'No cards found');
        res.status(404).send('No cards found.');

        return;
    }

    res.send(cards);
    return;

})

router.get('/:id', async (req, res) => {
    try {
        const card = await Card.findById(req.params.id);

        if (!card) {
            logRequest(404, 'No card found with this id.');
            res.status(404).send('No card found with this id.');
            return;
        }

        res.send(card);
        return;
    } catch (err) {
        logRequest(500, `Server Error: ${err.message}`);
        res.status(500).send(`Server Error: ${err.message}`);
        return;
    }


})

router.post('/', authMW, async (req, res) => {
    // Validate the request
    const { error } = validateCard(req.body);
    if (error) {
        logRequest(400, error.details[0].message);
        res.status(400).send(error.details[0].message);
        return;
    }

    /* validate system */
    const user = await User.findById(req.user._id);

    if (!user.isBusiness) {
        logRequest(400, "just a business user can create a new card.");
        res.status(400).send("just a business user can create a new card.");
        return;
    }

    const card = await new Card({
        ...req.body,
        user_id: req.user._id,
        bizNumber: await generateBizNumber(),
    })

    await card.save();
    res.send(card);


});

router.put('/:id', authMW, async (req, res) => {
    try {
        const { error } = validateCard(req.body);
        if (error) {
            logRequest(400, error.details[0].message);
            res.status(400).send(error.details[0].message);
            return;
        }

        if (Object.keys(req.body).length === 0) {
            logRequest(400, 'please provide the update details');
            res.status(400).send("please provide the update details");
            return;
        }

        const card = await Card.findByIdAndUpdate(req.params.id,
            req.body,
            { returnDocument: "after" }
        )
        if (!card) {
            logRequest(404, 'No card found with this id.');
            res.status(404).send('No card was found with the id.');
            return;
        }

        const registeredUser = req.user._id === card.user_id.toString() ? true : false;

        if (!registeredUser) {
            logRequest(400, 'just the registered user can edit the card information.');
            res.status(400).send("just the registered user can edit the card information.");
            return;
        }
        res.send(card);
    } catch (err) {
        logRequest(500, `Server Error: ${err.message}`);
        res.status(500).send(`Server Error: ${err.message}`);
    }
});

router.patch('/:id', authMW, async (req, res) => {

    let card = await Card.findById(req.params.id);
    if (!card) {
        logRequest(404, "The card with the given ID was not found.")
        return res.status(404).send('The card with the given ID was not found.');
    }

    if (card.likes.includes(req.user._id)) {
        logRequest(400, 'You have already liked this card.')
        return res.status(400).send('You have already liked this card.');
    }

    card.likes.push(req.user._id);
    await card.save();

    res.send(card);



})

router.delete('/:id', authMW, async (req, res) => {
    const card = await Card.findByIdAndDelete({ _id: req.params.id, user_id: req.user._id });
    if (!card) {
        logRequest(404, 'The card with the given ID was not found.');
        res.status(404).send('The card with the given ID was not found.');
        return;
    }
    res.send(`the card : ${card} was deleted`);
})

router.patch('/bizNumber/:id', authMW, async (req, res) => {

    const adminUser = req.user.admin;
    if (!adminUser) {
        logRequest(403, "Access denied. Only admin can change business number.")
        res.status(403).send("Access denied. Only admin can change business number.");
        return;
    }

    const card = await Card.findById(req.params.id);
    if (!card) {
        logRequest(404, 'The card with the given ID was not found.');
        res.status(404).send('The card with the given ID was not found.');
        return;
    }
    const newbizNumber = await generateBizNumber();

    const cardWithBizNumber = await Card.find({ bizNumber: newbizNumber });
    if (cardWithBizNumber.length > 0) {
        logRequest(400, 'The new business number already exists in the database.');
        res.status(400).send('The new business number already exists in the database.');
        return;
    }
    card.bizNumber = newbizNumber;
    await card.save();
    res.send(`the bizNumber of the card was changed to this number: ${card.bizNumber}`);
})

module.exports = router;
