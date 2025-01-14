const PORT = 3001;

const mongoose = require('mongoose');
const morgan = require('morgan');
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const bcrypt = require('bcrypt')
const { User } = require("./schema/users");
const { Card } = require("./schema/cards");

const usersRouter = require("./routes/users");
const cardsRouter = require("./routes/cards");
const { initialusers } = require('./data/initialusers');
const { initialCards } = require('./data/initialCards')

const app = express();

app.use(morgan("dev"));
app.use(express.json());
app.use(cors());

/* users */
app.use("/api/users", usersRouter);

/* cards */
app.use("/api/cards", cardsRouter)


const uri = process.env.ENVIRONMENT === "production" ? process.env.CONNECTION_STRING_ATLAS : process.env.LOCAL_CONNECTION_STRING;

// Connect to MongoDB 
async function connect() {
    await mongoose.connect(uri)
        .then(() => uri == process.env.LOCAL_CONNECTION_STRING ? console.log("Connected to MongoDB") : console.log("You connect to Atlas Server"))
        .catch(err => console.log("Error :" + err.message))

    app.listen(PORT,
        /* יצירת 3 משתמשים  אוטומטיים */
        () => {
            if (uri == process.env.LOCAL_CONNECTION_STRING) {
                createUsers();
                createCards();

            }
            console.log(`Server is running on port ${PORT}`);
        })

}
connect();

async function createUsers() {
    const usersFromDb = await User.find();
    initialusers.forEach(async user => {
        if (usersFromDb.find((dbUser) => dbUser.email === user.email)) {
            return;
        }
        const newUser = new User(user);
        newUser.password = await bcrypt.hash(newUser.password, 12);
        newUser.save();
    });
}
async function createCards() {
    initialCards.forEach(async (card) => {
        const cardsLength = await Card.find().countDocuments();
        if (cardsLength > 3) {
            return;
        }
        const newCard = new Card(card);
        await newCard.save();
    });

}




