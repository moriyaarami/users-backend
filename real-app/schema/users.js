const mongoose = require('mongoose');
const Joi = require('joi');

const userSchema = new mongoose.Schema({
    name: {
        first: {
            type: String,
            required: true,
            minlength: 2,
            maxlength: 255,
        },
        middle: {
            type: String,
            maxlength: 255,
        },
        last: {
            type: String,
            required: true,
            minlength: 2,
            maxlength: 255,
        },
        _id: {
            type: mongoose.Schema.Types.ObjectId,
            default: () => new mongoose.Types.ObjectId()
        }
    },
    image: {
        url: {
            type: String,
            minlength: 5,
            maxlength: 2048,
            default: "https://th.bing.com/th/id/OIP.0uaGrLEY_HxDEyklFhqGXgAAAA?rs=1&pid=ImgDetMain",

        }, alt: {
            type: String,
            minlength: 5,
            maxlength: 2048,
            default: "profile image",
        }, _id: {
            type: mongoose.Schema.Types.ObjectId,
            default: () => new mongoose.Types.ObjectId()
        }
    },
    phone: {
        type: String,
        required: true,
        minlength: 9,
        maxlength: 10,


    },
    email: {
        type: String,
        required: true,
        unique: true,
        minlength: 6,
        maxlength: 255,
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
        maxlength: 1024,
    },
    address: {
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
    isAdmin: {
        type: Boolean,
        default: false,
    },
    isBusiness: {
        type: Boolean,
        default: false,
    },
    createAt: { type: Date, default: new Date() }
});

const User = mongoose.model("User", userSchema, "users");

function validateUser(user) {
    const schema = Joi.object({
        name: Joi.object({
            first: Joi.string().min(2).max(255).required(),
            middle: Joi.string().allow("").max(255),
            last: Joi.string().min(2).max(255).required(),
        }).required(),
        image: Joi.object({
            url: Joi.string().min(5).max(2048),
            alt: Joi.string().min(5).max(2048),
        }),
        phone: Joi.string().min(9).max(10).required(),
        email: Joi.string().min(6).max(255).required().email(),
        password: Joi.string().min(6).max(1024).required(),
        address: Joi.object({
            state: Joi.string().allow("").max(255),
            country: Joi.string().min(2).max(255).required(),
            city: Joi.string().min(2).max(255).required(),
            street: Joi.string().min(2).max(255).required(),
            houseNumber: Joi.string().min(1).max(255).required(),
            zip: Joi.string().allow("").max(7),
        }).required(),
        isBusiness: Joi.boolean(),
        isAdmin: Joi.boolean(),
    });

    return schema.validate(user);
}

function validateLoginUser(obj) {
    const schema = Joi.object({
        email: Joi.string().min(6).max(255).required().email(),
        password: Joi.string().min(6).max(1024).required(),
    });

    return schema.validate(obj);
}

function validateUpdateUser(user) {
    const schema = Joi.object({
        name: Joi.object({
            first: Joi.string().min(2).max(255).required(),
            middle: Joi.string().allow("").max(255),
            last: Joi.string().min(2).max(255).required(),
        }),
        image: Joi.object({
            url: Joi.string().min(5).max(2048),
            alt: Joi.string().min(5).max(2048),
        }),
        phone: Joi.string().min(9).max(10).required(),
        address: Joi.object({
            state: Joi.string().allow("").max(255),
            country: Joi.string().min(2).max(255).required(),
            city: Joi.string().min(2).max(255).required(),
            street: Joi.string().min(2).max(255).required(),
            houseNumber: Joi.string().min(1).max(255).required(),
            zip: Joi.string().allow("").max(7),
        })
    });

    return schema.validate(user);
}





module.exports = { User, validateUser, validateLoginUser, validateUpdateUser };
