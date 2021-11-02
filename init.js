const mongoose = require("mongoose");
const User = require("./models/UserModel");
const Movie = require("./models/MovieModel");
const Person = require("./models/PersonModel");
const Review = require("./models/ReviewModel");
let movies = require("./data/movie-trimmed.json");
let users = require("./data/userdata.json");
let reviews = require("./data/reviewdata.json");

const faker = require("faker");
const {count} = require("./models/MovieModel");
const ReviewModel = require("./models/ReviewModel");
//const ReviewModel = require("./models/ReviewModel");
const uri =
    "mongodb+srv://helen:RVayMVPaFrWYWQA1@moviedb.b6utl.mongodb.net/moviedb?retryWrites=true&w=majority";
//clear the images folder on startup
let maxUser = 100;
let userList = [];

users.forEach((u) => {
    let user = new User(u);
    userList.push(user);
});

let movieList = [];
movies.forEach((movie) => {
    let m = new Movie(movie);
    //m.reviews = movie.reviews;
    movieList.push(m);
});

let peopleList = [];
let alreadyexist = [];
//console.log(movieList[0]);
let reviewlimit = 10;
let totalReviews = 0;
let reviewsSaved = 0;
//let completedPeople = 0;

let reviewlist = [];
reviews.forEach((review) => {
    let rev = new Review(review);
    let u = exists(userList, review.user);
    if (u) {
        rev.user = u;
    }
    let m = movieexists(movieList, review.movie);
    if (m) {
        rev.movie = m;
    }
    reviewlist.push(rev);
});

movieList.forEach((movie) => {
    let n = Math.floor(Math.random() * reviewlimit);
    totalReviews += n;
    movie.Writer.forEach((w) => {
        //console.log(p);

        let e = exists(peopleList, w);
        if (e === undefined) {
            let p = new Person();
            p.name = w;
            p.moviesWrote.push(movie);
            //movie.writerIDs.push(p);
            peopleList.push(p);
        } else {
            if (!e.moviesWrote.includes(movie)) {
                e.moviesWrote.push(movie);
            }
            // if (!movie.writerIDs.includes(e)) {
            //     //movie.writerIDs.push(e);
            // }
        }
    });
    movie.Actors.forEach((actor) => {
        let e = exists(peopleList, actor);
        if (e === undefined) {
            let a = new Person();
            a.name = actor;
            a.moviesActed.push(movie);
            //movie.actorIDs.push(a);
            peopleList.push(a);
        } else {
            if (!e.moviesActed.includes(movie)) {
                e.moviesActed.push(movie);
            }
            // if (!movie.actorIDs.includes(e)) {
            //     //movie.actorIDs.push(e);
            // }
        }
    });

    movie.Director.forEach((director) => {
        let e = exists(peopleList, director);
        if (e === undefined) {
            let d = new Person();
            d.name = director;
            d.moviesDirected.push(movie);
            //movie.directorIDs.push(d);
            peopleList.push(d);
        } else {
            if (!e.moviesDirected.includes(movie)) {
                e.moviesDirected.push(movie);
            }
            // if(!movie.directorIDs.includes(e))
            //     movie.directorIDs.push(e);
        }
    });
});

function exists(list, name) {
    return list.find(function (p) {
        return p.name === name;
    });
}

function movieexists(list, name) {
    return list.find(function (p) {
        return p.Title === name;
    });
}
function reviewexists(list, rev) {
    return list.find(function (r) {
        return r.review === rev;
    });
}
userList.forEach((userA) => {
    for (i = 0; i < 5; i++) {
        let index = Math.floor(Math.random() * userList.length);
        if (!(index === userList.indexOf(userA))) {
            let userB = userList[index];

            if (!userA.followers.includes(userB._id)) {
                userA.followers.push(userB);
            }
        }

        //console.log(userList.some((item) => item.name === userA.name));
    }
});

userList.forEach((user) => {
    for (i = 0; i < 6; i++) {
        let p = peopleList[Math.floor(Math.random() * peopleList.length)];
        if (!p.followers.includes(user)) {
            p.followers.push(user);
        }
    }
});

mongoose.connect(uri, {useNewUrlParser: true});
let db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
    //console.log(peopleList);
    mongoose.connection.db.dropDatabase(function (err, result) {
        if (err) {
            console.log("Error dropping database:");
            console.log(err);
            return;
        }
        console.log("Dropped database. Starting re-creation.");
        let completedPeople = 0;
        peopleList.forEach((p) => {
            p.save(function (err, result) {
                if (err) throw err;
                completedPeople++;
                //console.log(result);
                if (completedPeople >= peopleList.length) {
                    console.log("All " + completedPeople + " people saved");
                }
            });
        });

        let completedMovies = 0;
        movieList.forEach((m) => {
            m.save(function (err, result) {
                if (err) throw err;
                completedMovies++;
                if (completedMovies >= movieList.length) {
                    console.log("All " + completedMovies + " movies saved");
                }
            });
            //console.log(m.Title)
        });

        // userList[3] = userList[3].notifications.push({
        //     notif: "jghbjnf",
        //     link: "hjb",
        // });

        //console.log(userList[3]);
        let completedUsers = 0;
        userList.forEach((user) => {
            user.save(function (err, result) {
                if (err) throw err;
                completedUsers++;
                if (completedUsers >= userList.length) {
                    console.log("All " + completedUsers + " users saved.");
                }
            });
        });

        let completedreviews = 0;
        reviewlist.forEach((rev) => {
            rev.save(function (err, result) {
                if (err) throw err;
                completedreviews++;
                if (completedreviews >= reviewlist.length) {
                    console.log("All " + completedreviews + " reviews saved");
                }
            });
        });
    });
});
