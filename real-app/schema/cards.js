const Joi = require('joi');
const _ = require('lodash');
const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
    "title": {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 255,
    },
    "subtitle": {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 255,
    },
    "description": {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 255,
    },
    "phone": {
        type: String,
        required: true,
        minlength: 9,
        maxlength: 10,
    },
    "email": {
        type: String,
        required: true,
        minlength: 6,
        maxlength: 255,
    },
    "web": {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 255,
    },
    "image": {
        url: {
            type: String,
            maxlength: 2048,
            default: "https://th.bing.com/th/id/OIP.0uaGrLEY_HxDEyklFhqGXgAAAA?rs=1&pid=ImgDetMain",

        }, alt: {
            type: String,
            maxlength: 2048,
            default: "card image",
        }, _id: {
            type: mongoose.Schema.Types.ObjectId,
            default: () => new mongoose.Types.ObjectId()
        }
    },
    "address": {
        state: {
            type: String,
            maxlength: 255,
        },
        country: {
            type: String,
            required: true,
            minlength: 2,
            maxlength: 255,
        },
        city: {
            type: String,
            required: true,
            minlength: 2,
            maxlength: 255,
        },
        street: {
            type: String,
            required: true,
            minlength: 2,
            maxlength: 255,
        },
        houseNumber: {
            type: String,
            required: true,
            min: 1,
            max: 255,
        },
        zip: {
            type: String,
            maxlength: 7,
        },
        _id: {
            type: mongoose.Schema.Types.ObjectId,
            default: () => new mongoose.Types.ObjectId()
        }
    },
    "bizNumber": {
        type: String,
        default: "",
    },
    "likes": {
        type: Array,
        default: [],
    },
    "user_id": {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User._id",
    },
    "created_at": {
        type: Date, default: new Date()
    },
});

const Card = mongoose.model("Card", cardSchema, "cards");

async function generateBizNumber() {
    while (true) {
        const random = _.random(100, 9_999_999_999);
        const card = await Card.findOne({ bizNumber: random });
        if (!card) {
            return random;
        }
    }
}

function validateCard(card) {
    const schema = Joi.object({
        title: Joi.string().min(2).max(255).required(),
        subtitle: Joi.string().min(2).max(255).required(),
        description: Joi.string().min(2).max(255).required(),
        phone: Joi.string().min(9).max(10).required(),
        email: Joi.string().min(6).max(255).required().email(),
        web: Joi.string().min(2).max(255).required(),
        image: Joi.object({
            url: Joi.string().max(2048).allow(""),
            alt: Joi.string().max(2048).allow(""),
        }),
        address: Joi.object({
            state: Joi.string().allow("").max(255),
            country: Joi.string().min(2).max(255).required(),
            city: Joi.string().min(2).max(255).required(),
            street: Joi.string().min(2).max(255).required(),
            houseNumber: Joi.string().min(1).max(255).required(),
            zip: Joi.string().allow("").max(7),
        }),
    })
    return schema.validate(card);
};

module.exports = { Card, generateBizNumber, validateCard };