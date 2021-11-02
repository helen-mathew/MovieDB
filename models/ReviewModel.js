const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let reviewSchema = Schema({
    movie: { type: Schema.Types.ObjectId, ref: "Movie", require: true },
    rating: {
        type: Number,
        required: [true, "You need to enter a rating out of 10"],
    },
    review: { type: String },
    user: { type: Schema.Types.ObjectId, ref: "User", require: true },
});

module.exports = mongoose.model("Review", reviewSchema);
