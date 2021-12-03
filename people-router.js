const express = require("express");
const fs = require("fs");

let router = express.Router();

const User = require("./models/UserModel");
const Movie = require("./models/MovieModel");
const Person = require("./models/PersonModel");
const Review = require("./models/ReviewModel");

router.get("/follow/:pid", async function (req, res) {
    if (!req.session.user) {
        res.redirect("/login");
    } else {
        let userA = await User.findOne({_id: req.session.user._id});

        let person = await Person.findOne({_id: req.params.pid});

        if (person.followers.includes(userA._id)) {
            person.followers.splice(person.followers.indexOf(userA._id), 1);
            person.save();
            //req.session.user = userA;
            res.redirect("/users/" + req.session.user._id + "/following");
        } else {
            person.followers.push(userA);
            person.moviesActed.forEach((m) => {
                if (!userA.recommendations.includes(m)) {
                    userA.recommendations.push(m);
                    //console.log(user.recommendations);
                }
            });
            person.moviesWrote.forEach((m) => {
                if (!userA.recommendations.includes(m)) {
                    userA.recommendations.push(m);
                }
            });
            person.moviesDirected.forEach((m) => {
                if (!userA.recommendations.includes(m)) {
                    userA.recommendations.push(m);
                }
            });
            userA.save();
            person.save();
            req.session.user = userA;
            res.redirect("/users/" + req.session.user._id + "/following");
        }
    }
});

router.get("/create", function (req, res) {
    req.session.url = "/people/create";
    if (req.session.user) {
        if (req.session.user.contributing) {
            res.render("pages/createperson", {
                session: req.session,
                error: [],
            });
            //res.send("create");
        } else {
            res.status(401).send(
                "Only contributing users can add person, change your status in profile"
            );
        }
    } else {
        res.redirect("/login");
    }
});

router.get("/:pid", function (req, res) {
    req.session.url = "/people/" + req.params.pid;

    Person.findOne({_id: req.params.pid})
        .populate("moviesWrote", "Title")
        .populate("moviesDirected", "Title")
        .populate("moviesActed", "Title")

        .exec(function (err, result) {
            if (err) {
                console.log(err.message);
            }
            if (!result) {
                res.status(404).render("pages/404", {session: req.session});
            } else {
                req.person = result;
                result.frequentcollabs(function (err, collabs) {
                    if (err) {
                        console.log(err);
                    }
                    //console.log(collabs);
                    req.person.collabs = collabs;
                    //console.log(req.person);
                    res.format({
                        "text/html": function () {
                            //res.send(result);
                            res.render("pages/person", {
                                person: req.person,
                                session: req.session,
                            });
                        },
                        "application/json": function () {
                            //console.log(req.person);
                            res.send(JSON.stringify(req.person));
                        },
                    });
                });
                // console.log("Person found:");
                // console.log(result);
            }
        });
});

router.get("/", [queryParser, searchPeople]);

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

function searchPeople(req, res) {
    req.session.url = "/people";
    let searchresults = [];
    let name = req.query.name;
    //console.log(name);
    let skip = (req.query.page - 1) * req.query.limit;
    let q = {};
    if (name) {
        q = {name: {$regex: name, $options: "i"}};
    }

    Person.find(q)
        .limit(req.query.limit)
        .skip(skip)
        .exec(function (err, result) {
            if (err) {
                console.log(err);
            }
            res.format({
                "text/html": function () {
                    //res.send(req.movie);
                    res.render("pages/search", {
                        searchresults: result,
                        searchtype: "advanced",
                        query: req.query,
                        session: req.session,
                        resulttype: "people",
                    });
                },

                "application/json": function () {
                    res.send(JSON.stringify(result));
                },
            });
        });
}

router.post("/", function (req, res) {
    req.session.url = "/people/create";

    let personname = req.body.name;

    Person.findOne(
        {name: new RegExp(`^${personname}$`, "i")},
        function (err, result) {
            if (err) {
                console.log(err);
                return;
            }
            if (result) {
                res.status(300).send("exists");
            } else {
                let p = new Person();
                p.name = personname;
                p.save();
                res.format({
                    "text/html": function () {
                        res.send("/people/" + p.id);
                    },

                    "application/json": function () {
                        res.send(JSON.stringify(p));
                    },
                });
            }
        }
    );
});

module.exports = router;
