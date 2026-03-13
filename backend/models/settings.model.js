const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema({
    electionEndDate: {
        type: Date,
        default: null,
    },
});

module.exports = mongoose.model("Settings", settingsSchema);
