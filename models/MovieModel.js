const mongoose = require("mongoose");
const { populate } = require("./UserModel");
const Schema = mongoose.Schema;

let movieSchema = Schema({
    Title: { type: String, require: [true, "Must have a title"] },
    Year: { type: Number, require: [true, "Must have a year"] },
    Runtime: { type: Number },
    Genres: { type: [String], require: [true, "Must have at least one genre"] },
    directors: [
        {
            type: Schema.Types.ObjectId,
            ref: "Person",
        },
    ],
    Director: { type: [String] },
    writers: [
        {
            type: Schema.Types.ObjectId,
            ref: "Person",
        },
    ],
    Writer: { type: [String] },
    actors: [
        {
            type: Schema.Types.ObjectId,
            ref: "Person",
        },
    ],
    Actors: { type: [String], require: [true, "Must have at leasr one actor"] },
    Plot: { type: String, require: [true, "Must have plot"] },
    Poster: { type: String },
    averagerating: { type: Number, require: true, default: 0 },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review",
        },
    ],
});

movieSchema.methods.getReviews = function (callback) {
    this.model("Review")
        .find({ movie: this._id })
        .populate("user")
        .exec(callback);
};

movieSchema.methods.getActors = function (callback) {
    this.model("Person")
        .find({ moviesActed: this._id })
        .select("name")
        .exec(callback);
};
movieSchema.methods.getWriters = function (callback) {
    this.model("Person")
        .find({ moviesWrote: this._id })
        .select("name")
        .exec(callback);
};
movieSchema.methods.getDirectors = function (callback) {
    this.model("Person")
        .find({ moviesDirected: this._id })
        .select("name")
        .exec(callback);
};

movieSchema.methods.similar = function (skip, limit, callback) {
    this.model("Movie")
        .find({
            $and: [
                { Genres: { $in: this.Genres } },
                { _id: { $ne: this._id } },
            ],
        })
        .skip(skip)
        .limit(limit)
        .exec(callback);
};
// };
module.exports = mongoose.model("Movie", movieSchema);
