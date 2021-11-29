const express = require("express");
const app = express();
const fs = require("fs");
const moviesRoutes = require("./movies-router");
const userroutes = require("./users-router");
const peopleroutes = require("./people-router");
var bodyParser = require("body-parser");
require("dotenv").config();
// let movies = require("./data/movie-data-short.json");
// let people = require("./data/people.json");
// let users = require("./data/users.json");
// let reviews = require("./data/reviews.json");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);

const mongo_uri = process.env.MONGODB_URI;

console.log(mongo_uri);
const store = new MongoDBStore({
    uri: mongo_uri,
    collection: "mySessions",
});
//require("mongoose").set("debug", true);
const {json, application} = require("express");
const mc = require("mongodb").MongoClient; // Access the database (Javascript version of mongo shell)

const mongoose = require("mongoose");

mongoose.connect(mongo_uri, {useNewUrlParser: true});
//mongoose.set("debug", true);

const User = require("./models/UserModel");
const Movie = require("./models/MovieModel");
const Person = require("./models/PersonModel");
const Review = require("./models/ReviewModel");

app.set("view engine", "pug");

app.use(express.static("public"));

app.use(express.static("other"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use(
    session({
        secret: "secret",
        cookie: {maxAge: 1200000},
        rolling: true,
        store: store,
    })
);

// app.use(function (req, res, next) {
//     console.log("-------------------------");
//     console.log("Request Method: " + req.method);
//     console.log("Request URL: " + req.url);
//     console.log("Request PATH: " + req.path);
//     console.log("previous url: " + req.session.url);
//     console.log("session: ");
//     console.log(req.session.user);

//     next();
// });

app.use("/users", userroutes);
app.use("/people", peopleroutes);
app.use("/movies", moviesRoutes);
app.get("/recommended", [getRecMovies, sendRecs]);
app.get("/", [getRecMovies, sendHome]);
function getRecMovies(req, res, next) {
    //let skip = (req.query.page - 1) * req.query.limit;
    if (req.session.user) {
        User.findOne({_id: req.session.user._id}).exec(function (err, user) {
            if (err) {
                console.log(err);
                res.status(500).send("error reading db");
            }
            user.recommendations = [];

            Person.find({followers: user._id}).exec(function (err, people) {
                //console.log(people.moviesActed);
                if (err) {
                    console.log(err);
                    res.status(500).send("error reading db");
                }
                people.forEach((p) => {
                    p.moviesActed.forEach((m) => {
                        if (!user.recommendations.includes(m)) {
                            user.recommendations.push(m);
                            //console.log(user.recommendations);
                        }
                    });
                    p.moviesWrote.forEach((m) => {
                        if (!user.recommendations.includes(m)) {
                            user.recommendations.push(m);
                        }
                    });
                    p.moviesDirected.forEach((m) => {
                        if (!user.recommendations.includes(m)) {
                            user.recommendations.push(m);
                        }
                    });
                    //console.log(user.recommendations);
                });
                user.save();
                Movie.find({_id: {$in: user.recommendations}}).exec(function (
                    err,
                    result
                ) {
                    if (err) {
                        console.log(err);
                    }
                    //console.log(result);
                    req.movies = result;
                    //console.log(req.movies);
                    if (req.movies.length !== 0) next(); //only go to sendHome if the rec array has something, otherwise render regular home page (following if statement)
                });

                //console.log(user.recommendations.length);
            });
        });
    }
    if (!req.session.user || !req.movies) {
        Movie.find()
            .populate("directorID")
            .populate("actorsIDs")
            .populate("writerIDs")
            .exec(function (err, movies) {
                if (err) {
                    console.log(err);
                    res.status(500).send("error reading db");
                }
                //res.send(movies[0].Poster)
                req.movies = movies;
                //console.log(req.movies[1]);
                next();
            });
    }
}

function sendHome(req, res, next) {
    //console.log(req.movies);
    res.render("pages/home", {movies: req.movies, session: req.session});
}

function sendRecs(req, res, next) {
    res.render("pages/search", {
        searchresults: req.movies,

        session: req.session,

        searchtype: "recs",
    });
}
app.get("/login", function (req, res) {
    res.render("pages/login", {session: req.session});
});
app.get("/search", [queryParser, search, sendResults]);
app.post("/login", login);

app.get("/signup", function (req, res) {
    res.render("pages/signup", {session: req.session});
});
app.get("/logout", logout);
app.get("/advanced", function (req, res) {
    res.render("pages/advancedsearch", {session: req.session});
});

function login(req, res, next) {
    let userName = req.body.username;
    let password = req.body.password;

    //console.log(req.body);
    if (req.session.url === undefined) {
        req.session.url = "/";
    }

    User.findOne({username: userName}).exec(function (err, result) {
        if (err) {
            //res.status(401).send("no user");
            console.log(err);
            return;
        }

        if (result === null) {
            res.status(401).send("no user");
        } else {
            if (password === result.password) {
                req.session.user = result;
                //console.log(req.session);
                //console.log("found" + result);
                res.status(200).send("/users/" + result.id);
            } else {
                res.status(401).send("wrong password");
            }
        }
    });
}

function logout(req, res, next) {
    if (req.session.user) {
        delete req.session.user;
        res.redirect("/login");
    } else {
        res.send("You're not logged in");
    }
}

function queryParser(req, res, next) {
    const max_limit = 10;

    try {
        req.query.limit = req.query.limit || 10;
        req.query.limit = Number(req.query.limit);
        if (req.query.limit > max_limit) {
            req.query.limit = max_limit;
        }
    } catch {
        req.query.limit = 10;
    }
    try {
        req.query.page = req.query.page || 1;
        req.query.page = Number(req.query.page);
        if (req.query.page < 1) {
            req.query.page = 1;
        }
    } catch {
        req.query.page = 1;
    }
    next();
}
function search(req, res, next) {
    //console.log("huh");
    let skip = (req.query.page - 1) * req.query.limit;
    let q = req.query.search;
    console.log("search:" + q);
    if (q.length === 0) {
        //console.log("empty");
        res.render("pages/emptysearch", {
            loggedin: req.session.loggedin,
            session: req.session,
        });
    } else {
        let category = req.query.category;
        req.session.url = "/search?category=" + category + "&search=" + q;
        req.results = [];

        if (category === "movies") {
            Movie.find({Title: {$regex: q, $options: "i"}})
                .limit(req.query.limit)
                .skip(skip)
                .exec(function (err, result) {
                    if (err) {
                        console.log(err.message);
                    }
                    req.results = result;
                    next();
                });
        } else if (category === "people") {
            Person.find({name: {$regex: q, $options: "i"}})
                .limit(req.query.limit)
                .skip(skip)
                .exec(function (err, result) {
                    if (err) {
                        console.log(err.message);
                    }
                    req.results = result;
                    next();
                });
        } else if (category === "users") {
            User.find({name: {$regex: q, $options: "i"}})
                .limit(req.query.limit)
                .skip(skip)
                .exec(function (err, result) {
                    if (err) {
                        console.log(err.message);
                    }
                    req.results = result;
                    next();
                });
        }
    }
}

function sendResults(req, res, next) {
    res.format({
        "text/html": function () {
            res.render("pages/search", {
                searchresults: req.results,
                q: req.query.search,
                category: req.query.category,
                session: req.session,
                query: req.query,
                searchtype: "general",
            });
        },

        "application/json": function () {
            res.send(JSON.stringify(req.results));
        },
    });
}

app.get("/getupdates", function (req, res, next) {
    if (req.session.user) {
        User.findOne({_id: req.session.user._id}).exec(function (err, result) {
            if (err) {
                console.log(err);
            }

            res.render("partials/notifs", {
                session: req.session,
                user: result,
            });
        });
    } else {
        res.end();
    }
});
app.delete("/notifications", function (req, res) {
    //console.log("request received");
    if (req.session.user) {
        User.findOne({_id: req.session.user._id}).exec(function (err, user) {
            if (err) {
                console.log(err);
            }
            user.notifications = [];
            user.save();
            //console.log(user);
            res.render("pages/notifs", {
                session: req.session,
                user,
            });
        });
    }
});

app.listen(process.env.PORT || 3000);
console.log("server listening");
let db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
    console.log("connected to database");
});
