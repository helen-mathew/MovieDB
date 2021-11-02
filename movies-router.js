const express = require("express");
const fs = require("fs");

let router = express.Router();

const { search } = require("./users-router");

const { writer } = require("repl");
const { Mongoose } = require("mongoose");
const User = require("./models/UserModel");
const Movie = require("./models/MovieModel");
const Person = require("./models/PersonModel");
const Review = require("./models/ReviewModel");

let movieScheme = {};

router.use(express.static("public"));

router.use(express.static("other"));
router.use(queryParser);
router.get("/", [searchMovies]);
router.get("/create", function (req, res) {
    req.session.url = req.path;
    if (req.session.user) {
        if (req.session.user.contributing) {
            res.render("pages/createmovie", {
                session: req.session,
                error: [],
            });
        } else {
            res.status(401).send(
                "Only contributing users can add movies, change your status in profile"
            );
        }
    } else {
        res.redirect("/login");
    }
});
//router.post("/create", createMovie);

router.post("/:id/reviews", function (req, res) {
    if (!req.session.user) {
        res.status(401).send("login");
    } else {
        //let currentreviewid = reviews.length;
        let review = req.body.review;
        let rating = Number(req.body.rating);

        Movie.findOne({ _id: req.params.id }).exec(function (err, result) {
            if (err) throw err;
            let rev = new Review();
            rev.user = req.session.user;
            if (review) {
                rev.review = review;
            }
            rev.rating = rating;
            rev.movie = result._id;
            //console.log(req.session.user._id);
            User.findOne({ _id: req.session.user._id })
                .populate("followers")
                .exec(function (err, user) {
                    if (err) {
                        throw err;
                    }
                    //console.log(user);
                    user.followers.forEach((f) => {
                        f.notifications.push({
                            notif:
                                user.name +
                                " just added a review for " +
                                result.Title,
                            link: "/movies/" + result.id,
                        });
                        f.save();
                    });
                    Review.find({ movie: result._id }, function (err, reviews) {
                        if (err) throw err;
                        //console.log(reviews);
                        if (reviews.length === 0) {
                            result.averagerating = rev.rating;
                        } else {
                            let reviewcount = reviews.length;
                            //let totalrating = 0;
                            result.averagerating =
                                (result.averagerating * reviewcount +
                                    rev.rating) /
                                (reviewcount + 1);
                        }

                        result.save();
                        //console.log(result.averagerating);
                        rev.save();
                        res.send("/movies/" + result.id);
                    });
                });
        });
    }
});

router.get("/:mid", [renderMovie, sendMovie]);
router.get("/:mid/edit", [renderMovie, editMovie]);
function editMovie(req, res, next) {
    //console.log(req.movie);
    res.render("pages/createmovie", {
        movie: req.movie,
        session: req.session,
    });
}
// router.get("/:mid/similar",[queryParser])
router.get("/:mid/similar", function (req, res) {
    Movie.findOne({ _id: req.params.mid }).exec(function (err, movie) {
        if (err) {
            res.status(500).send("Error reading database");
        }
        //console.log(movie);
        let skip = (req.query.page - 1) * req.query.limit;
        movie.similar(skip, req.query.limit, function (err, result) {
            if (err) {
                res.status(500).send("Error reading database");
            }
            //console.log(result.length);
            //console.log(req.query.page);

            res.render("pages/search", {
                session: req.session,
                searchresults: result,
                similarto: movie,
                query: req.query,
            });
            //console.log(result);
        });
    });
});
router.post("/:mid/edit", function (req, res, next) {
    //console.log(req.body);
    let title = req.body.title;
    let year = Number(req.body.year);
    let genre = req.body.genre.split(", ");
    let plot = req.body.plot;
    let runtime = req.body.runtime;
    let directors = req.body.directors.split(", ");
    let actors = req.body.actors.split(", ");
    let writers = req.body.writers.split(",");
    let poster = req.body.poster;
    //console.log();
    Movie.findOne({ _id: req.params.mid }).exec(function (err, movie) {
        if (err) {
            console.log(err);
            return;
        }
        if (movie) {
            //let movie = new Movie();
            movie.Title = title;
            movie.Year = year;
            movie.Genres = genre;
            movie.Plot = plot;
            movie.Runtime = runtime;
            if (poster) {
                movie.Poster = poster;
            }
            // movie.Poster =
            //     "/img/uploadedmovieposters/" + movie._id + ".jpg";
            let people = actors.concat(writers, directors);

            people.forEach((a) => {
                Person.findOne({
                    name: new RegExp(`^${a}$`, "i"),
                })
                    .populate("followers")
                    .exec(function (err, result) {
                        if (err) {
                            console.log(err);
                            return;
                        }
                        //console.log(result);
                        if (result) {
                            //creates notifications for each follower of this person
                            result.followers.forEach((f) => {
                                f.notifications.push({
                                    notif:
                                        result.name +
                                        " has been added to a new movie.",
                                    link: "/movies/" + movie.id,
                                });
                                f.save();
                            });

                            if (actors.includes(a)) {
                                result.moviesActed.push(movie._id);

                                //movie.actorIDs.push(result._id);
                            }
                            if (writers.includes(a)) {
                                result.moviesWrote.push(movie._id);
                                //movie.writerIDs.push(result._id);
                            }
                            if (directors.includes(a)) {
                                result.moviesDirected.push(movie._id);
                                //movie.directorIDs.push(result._id);
                            }
                            result.save();
                            //creates a new person if they dont already exist
                        } else {
                            let p = new Person();
                            p.name = a;
                            if (actors.includes(a)) {
                                p.moviesActed.push(movie._id);
                                //movie.actorIDs.push(p._id);
                            }
                            if (writers.includes(a)) {
                                p.moviesWrote.push(movie._id);
                                //movie.writerIDs.push(p._id);
                            }
                            if (directors.includes(a)) {
                                p.moviesDirected.push(movie._id);
                                //movie.directorIDs.push(p._id);
                            }
                            p.save();

                            //console.log(p);
                        }
                        //movie.save();
                    });
            });
            movie.save();
            //console.log(movie);

            res.format({
                "text/html": function () {
                    res.send("/movies/" + movie.id);
                },

                "application/json": function () {
                    res.send(JSON.stringify(movie));
                },
            });
        }
    });
});
router.post("/", (req, res, next) => {
    //console.log(req.session);
    //console.log(req.body);
    req.session.url = "/movies/create";

    let title = req.body.title;
    let year = Number(req.body.year);
    let genre = req.body.genre.split(", ");
    let plot = req.body.plot;
    let runtime = req.body.runtime;
    let directors = req.body.directors.split(", ");
    let actors = req.body.actors.split(", ");
    let writers = req.body.writers.split(",");
    let poster = req.body.poster;
    //console.log(genre);
    Movie.findOne({ Title: new RegExp(`^${title}$`, "i") }).exec(function (
        err,
        result
    ) {
        if (err) {
            console.log(err);
            return;
        }
        if (result) {
            //console.log(result);
            res.status(300).send("exists");
        } else {
            let movie = new Movie();
            movie.Title = title;
            movie.Year = year;
            movie.Genres = genre;
            movie.Plot = plot;
            movie.Runtime = runtime;
            if (poster) {
                movie.Poster = poster;
            }
            // movie.Poster =
            //     "/img/uploadedmovieposters/" + movie._id + ".jpg";
            let people = actors.concat(writers, directors);

            people.forEach((a) => {
                Person.findOne({
                    name: new RegExp(`^${a}$`, "i"),
                })
                    .populate("followers")
                    .exec(function (err, result) {
                        if (err) {
                            console.log(err);
                            return;
                        }
                        //console.log(result);
                        if (result) {
                            //creates notifications for each follower of this person
                            result.followers.forEach((f) => {
                                f.notifications.push({
                                    notif:
                                        result.name +
                                        " has been added to a new movie.",
                                    link: "/movies/" + movie.id,
                                });
                                f.save();
                            });

                            if (actors.includes(a)) {
                                result.moviesActed.push(movie._id);

                                //movie.actorIDs.push(result._id);
                            }
                            if (writers.includes(a)) {
                                result.moviesWrote.push(movie._id);
                                //movie.writerIDs.push(result._id);
                            }
                            if (directors.includes(a)) {
                                result.moviesDirected.push(movie._id);
                                //movie.directorIDs.push(result._id);
                            }
                            result.save();
                            //creates a new person if they dont already exist
                        } else {
                            let p = new Person();
                            p.name = a;
                            if (actors.includes(a)) {
                                p.moviesActed.push(movie._id);
                                //movie.actorIDs.push(p._id);
                            }
                            if (writers.includes(a)) {
                                p.moviesWrote.push(movie._id);
                                //movie.writerIDs.push(p._id);
                            }
                            if (directors.includes(a)) {
                                p.moviesDirected.push(movie._id);
                                //movie.directorIDs.push(p._id);
                            }
                            p.save();

                            //console.log(p);
                        }
                        //movie.save();
                    });
            });
            movie.save();
            //console.log(movie);

            res.format({
                "text/html": function () {
                    res.send("/movies/" + movie.id);
                },

                "application/json": function () {
                    res.send(JSON.stringify(movie));
                },
            });
        }
    });
});

function renderMovie(req, res, next) {
    req.session.url = "/movies/" + req.params.mid;
    Movie.findOne({ _id: req.params.mid }).exec(function (err, result) {
        if (err) {
            console.log(err.message);
        }
        //console.log(result.actor());
        if (!result) {
            res.status(404).render("pages/404", { session: req.session });
        } else {
            //console.log("Movie found:");
            //console.log(result);
            req.movie = result;
            //res.send(result);
            result.getReviews(function (err, reviews) {
                if (err) {
                    console.log(err);
                }

                req.movie.reviews = reviews;

                result.getActors(function (err, actors) {
                    if (err) {
                        console.log(err);
                    }
                    req.movie.actors = actors;
                    result.getWriters(function (err, writers) {
                        if (err) {
                            console.log(err);
                        }

                        req.movie.writers = writers;
                        //console.log(req.movie.writers);
                        result.getDirectors(function (err, directors) {
                            if (err) {
                                console.log(err);
                            }
                            req.movie.directors = directors;
                            //console.log(req.movie.actors);
                            next();
                        });
                    });
                });
            });
        }
    });
}

function sendMovie(req, res, next) {
    res.format({
        "text/html": function () {
            //res.send(result.writerIDs);
            res.render("pages/movie", {
                movie: req.movie,
                session: req.session,
            });
        },

        "application/json": function () {
            res.send(JSON.stringify(req.movie));
        },
    });
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

function searchMovies(req, res) {
    req.session.url = "/movies";
    let skip = (req.query.page - 1) * req.query.limit;
    //let searchresults = [];
    let title = req.query.title;
    let genre = req.query.genre;
    year = Number(req.query.year) || "";
    let minrating = Number(req.query.minrating);
    // console.log(req.query);
    // console.log(minrating);
    let q = {};
    if (title || genre || year || minrating) {
        q.$and = [];
        if (year) {
            //res.send(JSON.stringify(year));
            //console.log(year);
            q.$and.push({ Year: year });
        }
        if (title) {
            q.$and.push({ Title: { $regex: title, $options: "i" } });
        }
        if (genre) {
            q.$and.push({ Genres: genre });
        }
        if (minrating) {
            q.$and.push({ averagerating: { $gte: minrating } });
        }
    }
    //console.log(q.$and);
    //let movies = find(q).getRating()
    Movie.find(q)
        .limit(req.query.limit)
        .skip(skip)
        .exec(function (err, result) {
            if (err) {
                console.log(err);
            }

            //console.log(result);
            req.movies = result;

            res.format({
                "text/html": function () {
                    //res.send(req.movie);
                    console.log(req.movies);
                    res.render("pages/search", {
                        searchresults: req.movies,
                        searchtype: "advanced",
                        query: req.query,
                        session: req.session,
                        resulttype: "movies",
                    });
                },

                "application/json": function () {
                    res.send(JSON.stringify(req.movies));
                },
            });
        });
}

module.exports = router;
