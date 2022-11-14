const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    email: String,
    displayName: String,
    password: String,
    wins: Number,
    losses: Number
});

module.exports = mongoose.model("Player", userSchema)