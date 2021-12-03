let movies = require("./data/movie-data.json");
const fs = require("fs");
let users = require("./data/userdata.json");
let reviews = require("./data/reviewdata.json");
const User = require("./models/UserModel");
const Movie = require("./models/MovieModel");
const Person = require("./models/PersonModel");
const Review = require("./models/ReviewModel");
const faker = require("faker");
let maxUser = 100;
let userList = [];

for (let i = 0; i < maxUser; i++) {
    let user = {};
    user.name = faker.name.firstName() + " " + faker.name.lastName();

    user.username = user.name.split(" ")[0];
    user.password = user.name.split(" ")[0];
    if (Math.random() < 0.5) {
        user.contributing = true;
    } else {
        user.contributing = false;
    }
    //console.log(user.contributing);
    user.followers = [];
    userList.push(user);
}

let movieList = [];
for (i = 0; i < 1000; i++) {
    //let movie = new Movie(movies[i]);
    movies[i].reviews = [];
    movieList.push(movies[i]);
}

let reviewlist = [];
movieList.forEach((movie) => {
    let n = Math.floor(Math.random() * 10);

    if (Math.random() < 0.75) {
        for (let i = 0; i < n; i++) {
            let user = userList[Math.floor(Math.random() * userList.length)];
            let review = {};

            review.user = user.name;
            review.movie = movie.Title;
            review.rating = Math.floor(Math.random() * 10);
            review.review = faker.lorem.paragraph();
            reviewlist.push(review);
            // movie.reviews.push(review);
            // review.save(function (err, result) {
            //     if (err) throw err;
            //     reviewsSaved++;
            //     //console.log(reviewsSaved + "/" + totalReviews + " saved");
            // });
        }
    }
    let totalrating = 0;
    let totalrevs = 0;
    reviewlist.forEach((r) => {
        if (r.movie === movie.Title) {
            totalrating += r.rating;
            totalrevs++;
        }
    });
    if (totalrevs === 0) {
        totalrevs = 1;
    }
    movie.averagerating = totalrating / totalrevs || 0;
});

console.log(userList[2]);
console.log(userList.length);
console.log(reviewlist.length);
console.log(movieList.length);
console.log(movieList[3]);
fs.rmdirSync("./public/img/uploadedmovieposters/", {
    recursive: true,
});
let path = "./public/img/".concat("uploadedmovieposters");
fs.mkdirSync(path);
fs.writeFileSync("./data/userdata.json", JSON.stringify(userList));
fs.writeFileSync("./data/reviewdata.json", JSON.stringify(reviewlist));
fs.writeFileSync("./data/movie-trimmed.json", JSON.stringify(movieList));
