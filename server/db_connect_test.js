const mongoose = require('mongoose');

mongoose.connect("mongodb://localhost:27017/rbac")
.then( () => {
    console.log("Connected to database successfully.")
});