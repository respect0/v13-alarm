const mongoose = require('mongoose');

module.exports = mongoose.model("alarmdata", mongoose.Schema({
    memberID: { type: String, default: null },
    alarmID: { type: Number, default: 0 },
    alarm: {
        name: "",
        saat: 0,
        repeat: false,
        gunler: {
            pazartesi: false,
            sali: false,
            carsamba: false,
            persembe: false,
            cuma: false,
            cumartesi: false,
            pazar: false,
        }
    }
}));