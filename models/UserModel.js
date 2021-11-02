const mongoose = require("mongoose");
const { schema } = require("./MovieModel");
const Schema = mongoose.Schema;

let userSchema = Schema({
    name: {
        type: String,
        require: [true, "Enter a name"],

        trim: true,
    },
    username: {
        type: String,
        require: [true, "You have to enter a username"],
        lowercase: true,
    },
    password: {
        type: String,
        require: [true, "You have to enter a password"],
        lowercase: true,
    },
    contributing: { type: Boolean, default: false, require: true },
    reviews: { type: Array, default: [], require: true },
    movies_added: { type: Array, default: [], require: true },

    followers: [{ type: Schema.Types.ObjectId, ref: "User" }],
    notifications: [{ notif: { type: String }, link: { type: String } }],
    recommendations: [{ type: Schema.Types.ObjectId, ref: "Movie" }],
});

userSchema.methods.getFollowingUser = function (callback) {
    this.model("User")
        .find({ followers: this._id })
        .select("name")
        .exec(callback);
};
userSchema.methods.getFollowingPeople = function (callback) {
    this.model("Person")
        .find({ followers: this._id })
        .select("name")
        .exec(callback);
};

userSchema.methods.getRecs = function () {
    let recMovies = [];
    this.model("Person")
        .find({ followers: this._id })
        .populate("moviesActed moviesDirected moviesWrote")
        .exec(function (err, people) {
            if (err) {
                console.log(err);
                res.status(500).send("error reading db");
            }
            people.forEach((p) => {
                p.moviesActed.forEach((m) => {
                    if (!recMovies.includes(m._id)) {
                        recMovies.push(m);
                    }
                });
                p.moviesWrote.forEach((m) => {
                    if (!recMovies.includes(m._id)) {
                        recMovies.push(m);
                    }
                });
                p.moviesDirected.forEach((m) => {
                    if (!recMovies.includes(m._id)) {
                        recMovies.push(m);
                    }
                });
            });
            console.log(recMovies.length);
            return recMovies.length;
        });
    return recMovies.length;
};

userSchema.methods.getReviews = function (callback) {
    this.model("Review")
        .find({ user: this._id })
        .populate("movie", "Title")

        .exec(callback);
};
module.exports = mongoose.model("User", userSchema);
