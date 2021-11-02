const movies = require("./data/movie-data.json");
//let people = require("./peoplecopy.json");
//let personid = people.length;
let fs = require("fs");
//let m = movies[0];

let x;
movies.forEach((m) => {
    m.Genres = [];
    //m.Director = m.Director.split(", ")
    m.Genre.forEach((g) => {
        m.Genres.push(g.toLowerCase());
    });
    // let array = [];
    //delete m.writers;
    // m.Writers = []
    // //m.Writer = m.Writer.split(", ");
    // m.Writer.forEach(w=>{
    //     m.Writers.push( w.slice(0,w.indexOf(' (')))
    // })
    //m.Actors = m.Actors.split(", ");
    // m.Writer = [];
    // m.Writers.forEach((w) => {
    //     if (exists(m.Writers, w)) {
    //         m.Writers.slice(m.Writers.indexOf(e), 1);
    //     }
    // });
    //m.Genre = m.Genre.split(", ");
    // m.Writer = [];
    // m.Writers.forEach((w) => {
    //     let e = exists(m.Writer, w);
    //     //console.log(e);
    //     if (e === undefined) {
    //         m.Writer.push(w);
    //         //m.Writers.slice(m.Writer.indexOf(e), 1);
    //     } else {
    //     }
    // });
    //delete m.Writer
    //delete m.Writers;
    //m.Writer;
    // m.Writer = array;
    // m.Year = Number(m.Year);
    // m.Runtime = m.Runtime.slice(0, -4);
    // m.Runtime = Number(m.Runtime);
    // delete m.Rated;
    // delete m.Awards;
    // delete m.Ratings;
    // delete m.Metascore;
    // delete m.imdbRating;
    // delete m.imdbVotes;
    // delete m.DVD;
    // delete m.BoxOffice;
    // delete m.Production;
    // delete m.Website;
    // delete m.Response;
    // delete m.Language;
    // delete m.Country;
    // delete m.Released;
    delete m.Genre;
});

function exists(list, name) {
    return list.find(function (p) {
        return p === name;
    });
}

console.log(movies[100]);
// fs.writeFile("./data/movie-data.json", JSON.stringify(movies), function (err) {
//     if (err) return console.log(err);
//})
