const mongoose = require("mongoose");
const { populate } = require("./MovieModel");
const Schema = mongoose.Schema;

let personSchema = Schema({
    name: { type: String, require: [true, "Enter a name"] },
    moviesWrote: [{ type: Schema.Types.ObjectId, ref: "Movie", default: [] }],
    moviesActed: [{ type: Schema.Types.ObjectId, ref: "Movie", default: [] }],
    moviesDirected: [
        {
            type: Schema.Types.ObjectId,
            ref: "Movie",
            default: [],
        },
    ],
    frequent_collaborators: { type: Array, require: true, default: [] },
    followers: [{ type: Schema.Types.ObjectId, ref: "User" }],
});

personSchema.methods.frequentcollabs = function (callback) {
    let movies = this.moviesDirected.concat(this.moviesActed, this.moviesWrote);
    movieids = [];
    //this.model("Person").find({ $or: [{}] });
    movies.forEach((m) => {
        movieids.push(m._id);
    });
    //console.log(movieids);
    //movies.forEach(m=>{
    this.model("Person")
        .find(
            {
                $and: [
                    {
                        $or: [
                            { moviesActed: { $in: movieids } },
                            { moviesDirected: { $in: movieids } },
                            { moviesWrote: { $in: movieids } },
                        ],
                    },
                    { _id: { $ne: this._id } },
                ],
            },
            { name: 1 }
        )
        .exec(callback);
    //})
};
module.exports = mongoose.model("Person", personSchema);
