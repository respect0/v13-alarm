const mongoose = require('mongoose');

module.exports = mongoose.model("guild", mongoose.Schema({
    guildID: {type: String, default: null},
}));