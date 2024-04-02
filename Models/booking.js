const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    userinfo: { type: String, required: true },
    organization: { type: String, required: true },
    tel: { type: Number, require: true },
    title: { type: String, require: true },
    day: { type: Date, required: true },
    start: { type: Date, required: true },
    placestart: { type: String, require: true },
    placeend: { type: String, require: true },
    end: { type: Date, require: true },
    passenger: { type: String, require: true },
    allDay: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

const Booking = mongoose.model("book", eventSchema);

module.exports = Booking;
