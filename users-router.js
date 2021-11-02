const express = require("express");
const fs = require("fs");
let router = express.Router();

const User = require("./models/UserModel");
router.use(express.static("public"));

router.use(express.static("other"));

router.post("/", createUser);
router.get("/", [queryParser, searchUsers]);

router.get("/follow/:uid", function (req, res) {
    if (!req.session.user) {
        res.redirect("/login");
    } else {
        User.findOne({ _id: req.session.user._id }, function (err, userA) {
            if (err) {
                console.log(err.message);
            }

            //userA = result;

            User.findOne({ _id: req.params.uid }, function (err, userB) {
                if (err) {
                    console.log(err.message);
                }

                if (userB.followers.includes(userA._id)) {
                    // userA.following.users.splice(
                    //     userA.following.users.indexOf(userB._id),
                    //     1
                    // );
                    userB.followers.splice(
                        userB.followers.indexOf(userA._id),
                        1
                    );
                    //userA.save();
                    userB.save();
                    req.session.user = userA;
                    res.redirect(
                        "/users/" + req.session.user._id + "/following"
                    );
                } else {
                    //userA.following.users.push(userB);
                    userB.followers.push(userA);
                    //userA.save();
                    userB.save();
                    req.session.user = userA;
                    res.redirect(
                        "/users/" + req.session.user._id + "/following"
                    );
                }
                //console.log(userA.following.users);
            });
        });
    }
});

router.get("/:uid/edit", function (req, res) {
    req.session.url = "/editprofile";
    if (req.session.user) {
        res.render("pages/editprofile", {
            session: req.session,
        });
    } else {
        res.redirect("/login");
    }
});

router.post("/:uid/edit", function (req, res) {
    req.session.url = req.path;
    if (req.session.user) {
        //console.log(req.params.uid);
        User.findOne({ _id: req.params.uid }).exec(function (err, user) {
            if (err) {
                console.log(err.message);
            }
            //console.log(user);
            user.name = req.body.name;
            user.username = req.body.username;
            user.password = req.body.password;
            if (req.body.contributing === "false") {
                user.contributing = false;
            } else if (req.body.contributing === "true") {
                user.contributing = true;
            }

            user.save();
            req.session.user = user;
            res.format({
                "text/html": function () {
                    res.redirect("/users/" + req.params.uid);
                },

                "application/json": function () {
                    res.send(JSON.stringify(user));
                },
            });
        });
    }
});

router.get("/:uid", function (req, res) {
    req.session.url = "/users/" + req.params.uid;
    User.findOne({ _id: req.params.uid }).exec(function (err, result) {
        if (err) {
            console.log(err.message);
        }
        if (!result) {
            res.status(404).render("pages/404", { session: req.session });
        } else {
            result.getFollowingUser(function (err, users) {
                if (err) {
                    console.log(err);
                }

                result.getFollowingPeople(function (err, people) {
                    if (err) {
                        console.log(err);
                    }

                    result.getReviews(function (err, reviews) {
                        if (err) {
                            console.log(err);
                        }
                        //console.log(reviews[2]);

                        req.user = result;
                        req.user.following = { users: [], people: [] };
                        req.user.following.people = people;
                        req.user.following.users = users;
                        req.user.reviews = reviews;
                        res.format({
                            "text/html": function () {
                                //res.send(result);
                                res.render("pages/profile", {
                                    user: req.user,
                                    session: req.session,
                                });
                            },
                            "application/json": function () {
                                res.send(JSON.stringify(result));
                            },
                        });
                    });
                });
            });
            //console.log(result);
        }
    });
});

router.get("/:uid/notifications", function (req, res) {
    if (req.session.user) {
        User.findOne({ _id: req.params.uid }).exec(function (err, result) {
            if (err) {
                console.log(err);
            }

            res.render("pages/notifs", {
                session: req.session,
                user: result,
            });
        });
    } else {
        res.redirect("/login");
    }
});

router.get("/:uid/followers", function (req, res) {
    req.session.url = "/users/" + req.params.uid + "/following";
    User.findOne({ _id: req.params.uid })
        .populate("followers", "name")
        .exec(function (err, result) {
            if (err) {
                console.log(err);
            }

            res.render("pages/followers", {
                session: req.session,
                user: result,
            });
        });
});
router.get("/:uid/following", function (req, res) {
    req.session.url = "/users/" + req.params.uid + "/following";

    User.findOne({ _id: req.params.uid }).exec(function (err, result) {
        if (err) {
            console.log(err);
        }
        result.getFollowingUser(function (err, users) {
            if (err) {
                console.log(err);
            }

            result.getFollowingPeople(function (err, people) {
                if (err) {
                    console.log(err);
                }
                req.user = result;
                req.user.following = { users: [], people: [] };
                req.user.following.people = people;
                req.user.following.users = users;

                res.render("pages/following", {
                    session: req.session,
                    user: req.user,
                });
            });
        });
    });
});

function createUser(req, res) {
    User.findOne({ username: req.body.username }).exec(function (err, result) {
        if (err) {
            console.log(err.message);
            return;
        }
        if (result) {
            res.status(300).send("exists");
        } else {
            let user = new User();
            user.name = req.body.name;
            user.username = req.body.username;
            user.password = req.body.password;
            user.save();
            req.session.user = user;
            //console.log(user);
            res.send("/users/" + user.id);
        }
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
function searchUsers(req, res) {
    req.session.url = "/users";
    let searchresults = [];
    let name = req.query.name;
    let skip = (req.query.page - 1) * req.query.limit;

    let q = {};
    if (name) {
        q = { name: { $regex: name, $options: "i" } };
    }

    User.find(q)
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
                        resulttype: "user",
                        session: req.session,
                        query: req.query,
                        searchtype: "advanced",
                    });
                },

                "application/json": function () {
                    res.send(JSON.stringify(result));
                },
            });
        });
}
module.exports = router;
