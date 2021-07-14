const express    = require('express');
const mongoose   = require('mongoose');
const bodyParser = require('body-parser');
const jwt        = require('jsonwebtoken');
const path       = require('path');
const user       = require('./models/userModel');
const routes     = require('./routes/route.js');


mongoose
    .connect("mongodb://localhost:27017/rbac")
    .then( () => {
        console.log("Connected to database successfully");
    });


require("dotenv").config({
    path: path.join(__dirname, "../.env")
})

const app = express();

const PORT = process.env.PORT || 3000;



app.use(express.urlencoded());

app.use(async (req, res, next) => {
    if (req.headers['x-access-token']) {
        const accessToken = req.headers['x-access-token'];
        const { userID, exp } = await jwt.verify(accessToken, process.env.JWT_SECRET);
        //Check if token has expired
        if (exp < Date.now().valueOf() / 1000) {
            return res.status(401).json({error: "JWT token has expired, please login to obtain a new one."})
        }
        res.locals.loggedInUser = await user.findById(userID); next();
    } else {
        next ();
    }
});

app.use('/', routes); app.listen(PORT, () => {
    console.log("Server is listening on Port:", PORT)
})

