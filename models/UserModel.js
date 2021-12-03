const mongoose = require("mongoose");
const {schema} = require("./MovieModel");
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
    contributing: {type: Boolean, default: false, require: true},
    reviews: {type: Array, default: [], require: true},
    movies_added: {type: Array, default: [], require: true},

    followers: [{type: Schema.Types.ObjectId, ref: "User"}],
    notifications: [{notif: {type: String}, link: {type: String}}],
    recommendations: [{type: Schema.Types.ObjectId, ref: "Movie"}],
});

userSchema.methods.getFollowingUser = function () {
    return new Promise(async (resolve, reject) => {
        let following = await this.model("User")
            .find({followers: this._id})
            .select("name");

        resolve(following);
    });
};
userSchema.methods.getFollowingPeople = function () {
    return new Promise(async (resolve, reject) => {
        let following = await this.model("Person")
            .find({followers: this._id})
            .select("name");

        resolve(following);
    });
};

userSchema.methods.getRecs = function () {
    let recMovies = [];
    this.model("Person")
        .find({followers: this._id})
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

userSchema.methods.getReviews = function () {
    return new Promise(async (resolve, reject) => {
        let reviews = this.model("Review")
            .find({user: this._id})
            .populate("movie", "Title");

        resolve(reviews);
    });
};
module.exports = mongoose.model("User", userSchema);
