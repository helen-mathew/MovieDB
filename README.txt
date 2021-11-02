1. I'm working on the Movie database project
2. No partner
3. I am currently working on making the pages responsive. A few pages like the homepage, movie, login/signup and a few others are mobile friendly.
4. 
    1) I have a basic search bar that is accessible from any page. This supports basic searches in four different categories (All, Movies, Users,People). It takes one query string and compares it to the movie titles, users' and people's names and returns objects that have matched depending on the category. 

    2) Additionally, I also have an 'advanced search page' that sends get requests to '/movies' '/people' or '/users' depending on the input. This supports multiple queries so a more detailed search can be made.

    3) Clicking the logo on the navbar from any page brings you back to the homepage
    4) Once logged in, the user's name will be always displayed on the right side of the navbar. Clicking this displays a dropdown menu that has links to their profile and the logout page. If they're a contributing user, there will be two more links to add a movie and to add a person.
    5) Once logged in, any other user profiles or person profiles the user visits will have a follow/unfollow button (depends on whether they already follow them or not). If the user clicks follow that person/user will show up on their 'following' list. If they click unfollow they will be removed from that list.
    6) The user can easily change their contributor status by clicking 'edit account' on their profile, and clicking the appropriate radio button.
    7) When creating a movie, the user can choose to upload a poster file for the movie as well. (I plan to do this with People as well as Users)
    8) If the actor that they entered while creating a movie does not already exist, a new one would be added to the system. (I plan to do the same with writers and directors in the future)

5) Openstack
    IP address: 134.117.129.200
    username:student
    password:helenmathew

6) Instructions:
    1) Open cmd/terminal and type in "ssh student@134.117.129.200" and enter
    2) type in the password (helenmathew)
    3) Open another terminal window, type in "ssh -L 9999:localhost:3000 student@134.117.129.200", hit enter, and type in the password
    4) Type in "cd CheckIn3" (full filepath: "home/student/CheckIn3")
    5) type in "node projectserver.js", hit enter
    6) Go to http://localhost:9999/ on the web browser.

Instructions on running the code 
    * The modify.js file contains code I used to modify the original movie data into a more usable format, you can ignore this 
    * The generator.js file is what I used to create random users and reviews for the database. You can ingore this too, unless you wanna create a new dataset with new users and new reviews.
    * The init.js file initializes the database by using the data in the userdata and reviewdata I created in the generator file. It also uses the moviedata to create people documents from it. Run this first. 