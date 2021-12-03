function dropdown() {
    //console.log("dropping");
    document.getElementById("usercontent").classList.toggle("display");
}

function notif() {
    //console.log("button");
    //console.log(window.location.href);
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            document.getElementById("notifs").innerHTML = this.responseText;
        }
    };

    xhttp.open("GET", "/getupdates");
    xhttp.send();
    //setInterval(notif, 3000);
}

function deletenotifs() {
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            // window.location.reload;
            //document.getElementById("notifs").innerHTML = this.responseText;
        }
    };

    xhttp.open("DELETE", "/notifications");
    xhttp.send();
}

//document.getElementById("log-btn").addEventListener("click", login);
function login() {
    //console.log("gjhbnk");

    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;
    if (!username || !password) {
        alert("Make sure you enter both your username and password");
    } else {
        let xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 401) {
                if (this.responseText === "no user") {
                    if (
                        confirm(
                            "No user found with this username. Click OK to go the signup page, or click Canel to try again"
                        )
                    ) {
                        window.location.href = "/signup";
                    }
                } else if (this.responseText === "wrong password") {
                    alert("The password you entered is wrong, try again!");
                }
            } else if (this.readyState == 4 && this.status == 200) {
                window.location.href = this.responseText;
            }
        };

        let userdata = {
            username: username,
            password: password,
        };
        xhttp.open("POST", "/login");
        xhttp.setRequestHeader("Content-Type", "application/json");
        xhttp.send(JSON.stringify(userdata));
    }
}

function signup() {
    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;
    let name = document.getElementById("name").value;
    if (!username || !password || !name) {
        alert("One or more of the fields are empty, try again!");
    } else {
        let xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 400) {
                if (this.responseText === "exists") {
                    if (
                        confirm(
                            "This user already exists. Click OK to go to the login page, click cancel to try again"
                        )
                    ) {
                        window.location.href = "http://localhost:3000/login";
                    }
                }
            } else if (this.readyState == 4 && this.status == 200) {
                window.location.href = this.responseText;
            }
        };

        let userdata = {
            username: username,
            password: password,
            name: name,
        };
        xhttp.open("POST", "/users");
        xhttp.setRequestHeader("Content-Type", "application/json");
        xhttp.send(JSON.stringify(userdata));
    }
}

function newmovie() {
    //console.log("fvghbkh");
    let title = document.getElementById("title").value;
    let year = document.getElementById("year").value;
    let genre = document.getElementById("genre").value;
    let runtime = document.getElementById("runtime").value;
    let directors = document.getElementById("directors").value;
    let writers = document.getElementById("writers").value;
    let actors = document.getElementById("actors").value;
    let plot = document.getElementById("plot").value;
    let poster = document.getElementById("poster").value;

    if (
        !title ||
        !year ||
        !genre ||
        !runtime ||
        !directors ||
        !writers ||
        !actors ||
        !plot
    ) {
        alert("One or more of the fields are empty, try again!");
    } else if (isNaN(year)) {
        alert("The year should be a number");
    } else if (isNaN(runtime)) {
        alert("The runtime should be a number");
    } else {
        let xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 300) {
                if (this.responseText === "exists") {
                    alert("This movie already exists");
                }
            } else if (this.readyState == 4 && this.status == 200) {
                window.location.href = this.responseText;
            }
        };

        let movie = {
            title: title,
            year: year,
            genre: genre,
            plot: plot,
            runtime: runtime,
            directors: directors,
            actors: actors,
            writers: writers,
            poster: poster,
        };
        console.log(movie);
        xhttp.open("POST", "/movies");
        xhttp.setRequestHeader("Content-Type", "application/json");
        xhttp.send(JSON.stringify(movie));
    }
}

function newperson() {
    //console.log("fvghbkh");
    let name = document.getElementById("name").value;

    if (!name) {
        alert("You have to enter a name!");
    } else {
        let xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 300) {
                if (this.responseText === "exists") {
                    alert("This person already exists");
                }
            } else if (this.readyState == 4 && this.status == 200) {
                window.location.href = this.responseText;
            }
        };

        let person = {
            name: name,
        };
        //console.log(movie);
        xhttp.open("POST", "/people");
        xhttp.setRequestHeader("Content-Type", "application/json");
        xhttp.send(JSON.stringify(person));
    }
}

function edit() {
    let title = document.getElementById("title").value;
    let year = document.getElementById("year").value;
    let genre = document.getElementById("genre").value;
    let runtime = document.getElementById("runtime").value;
    let directors = document.getElementById("directors").value;
    let writers = document.getElementById("writers").value;
    let actors = document.getElementById("actors").value;
    let plot = document.getElementById("plot").value;
    let poster = document.getElementById("poster").value;

    if (
        !title ||
        !year ||
        !genre ||
        !runtime ||
        !directors ||
        !writers ||
        !actors ||
        !plot
    ) {
        alert("One or more of the fields are empty, try again!");
    } else if (isNaN(year)) {
        alert("The year should be a number");
    } else if (isNaN(runtime)) {
        alert("The runtime should be a number");
    } else {
        let xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 300) {
                if (this.responseText === "exists") {
                    alert("This movie already exists");
                }
            } else if (this.readyState == 4 && this.status == 200) {
                window.location.href = this.responseText;
            }
        };

        let movie = {
            title: title,
            year: year,
            genre: genre,
            plot: plot,
            runtime: runtime,
            directors: directors,
            actors: actors,
            writers: writers,
            poster: poster,
        };
        console.log(movie);
        xhttp.open("POST", window.location.href);
        xhttp.setRequestHeader("Content-Type", "application/json");
        xhttp.send(JSON.stringify(movie));
    }
}

function addreview() {
    let review = document.getElementById("review").value;
    let rating = document.getElementById("rating").value;

    if (!rating) {
        alert("The rating field is empty, try again!");
    } else if (isNaN(rating)) {
        alert("The rating has to be a number!");
    } else {
        let xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 401) {
                if (this.responseText === "login") {
                    if (
                        confirm(
                            "Users have to be logged in to add reviews! Would you like to login?"
                        )
                    ) {
                        window.location.href = "/login";
                    }
                }
            } else if (this.readyState == 4 && this.status == 200) {
                window.location.href = this.responseText;
            }
        };

        let rev = {review: review, rating: rating};

        xhttp.open("POST", window.location.href + "/reviews");
        xhttp.setRequestHeader("Content-Type", "application/json");
        xhttp.send(JSON.stringify(rev));
    }
}
