const express = require("express");
const app = express();
const bcrypt = require("bcryptjs");
var cookieSession = require('cookie-session');

// importing functions
const { getUserByEmail, urlsforUser, generateRandomString } = require("./helpers.js");
// importing url database and users
const { urlDatabase, users } = require('./database');

const PORT = 8080;

app.set("view engine", "ejs");
app.use(express.urlencoded({extended: true}));
// sets key to cookie encryption
app.use(cookieSession({
  name: "cookie-name",
  keys: ['redhot'],
}));

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  // assigns cookie to user_id
  const user_id = req.session.user_id;
  const user = users[user_id];
  if (!user) {
    //checks if logged in
    res.status(401).send("<h3>You must be logged in to view.</h3>");
  } else {
    // returns urls they created
    const userUrls = urlsforUser(urlDatabase, user_id);
    const templateVars = { urls: userUrls, user: user };
    res.render("urls_index", templateVars);
  }
});

app.get("/urls/new", (req, res) => {
  // retrieves cookie
  const user_id = req.session.user_id;
  // retrieves user from user object
  const user = users[user_id];
  // checks cookie and redirects user if not logged in
  if (!user) { 
    res.redirect('/login');
  } else {
    const templateVars = { user: user };
    res.render("urls_new", templateVars);
  }
});

app.get("/urls/:id/", (req, res) => {
  const user_id = req.session.user_id;
  const user = users[user_id];
  // takes the short URL from the request URL parameters
  const shortURL = req.params.id;
  
  if (!user) {
    // if not logged in returns error
    res.status(401).send("<h3>You must be logged in to view</h3>");
    // if short URL does not exist OR the url does not match owner, returns an error message
  } else if (!urlDatabase[shortURL] || urlDatabase[shortURL].userID !== user_id) {
    res.status(403).send("<h3>You do not have permission to view</h3>");
  } else {
    const templateVars = { id: shortURL, longURL: urlDatabase[shortURL].longURL, user: user };
    res.render("urls_show", templateVars);
  }
});

app.get('/register', (req, res) => {
  const user_id = req.session.user_id; 
  const user = users[user_id];
  if (user) { 
    // checks cookie and redirects user to /urls if logged in
    res.redirect('/urls');
  } else {
    const templateVars = { user: user };
    res.render('register', templateVars);
  }
});

app.get('/login', (req, res) => {
  const user_id = req.session.user_id;
  const user = users[user_id];
  if (user) {
    res.redirect('/urls');
  } else {
    const templateVars = { user: user };
    res.render('login', templateVars);
  }
});


app.post("/register", (req, res) => {
  // generate random string for ID called from helpers
  const id = generateRandomString();
  const email = req.body.email; 
  const password = req.body.password;
  // encrypts password using bcrypt
  const hashedPassword = bcrypt.hashSync(password, 10);
  
  // create a new user object
  const newUser = { 
    id,
    email,
    password: hashedPassword,
  };
  
   // check if email or password left blank
  if (!email || !password) {
    res.status(400).send('Email and password are required');
    return;
  }
  
  if (getUserByEmail(email, users) !== null) {
    res.status(400).send('Email already exists');
    return;
  }
  
  // add newUser to database
  users[id] = newUser; 
  req.session.user_id = newUser.id;
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  const userInfo = getUserByEmail(email, users); 
  if (!userInfo) {
    res.status(403).send("Email not found.");
    return;
  }
  // if user_id equals true, login the user
  if (bcrypt.compareSync(password, userInfo.password)) { 
    req.session.user_id = userInfo.id; 
    res.redirect("/urls");
  } else {
    res.status(403).send("Email or password do not match. Please try again.");
  }
});

app.post("/logout", (req, res) => {
  // deletes cookie in browser
  req.session = null;
  res.redirect("/login");
});

app.post("/urls", (req, res) => {
  const user_id = req.session.user_id;
  const user = users[user_id];
  
  if (!user) {
    res.status(401).send("<h3>You must be logged in to shorten URLs.</h3>");
  } else if (!req.body.longURL || req.body.longURL.trim() === "") {
    res.status(400).send("<h3>Long URL cannot be empty.</h3>");
  } else {
    const shortURL = generateRandomString();
    urlDatabase[shortURL] = {
      longURL: req.body.longURL,
      userID: user_id
    };
    res.redirect(`/urls`);
  }
});

app.post("/urls/:id/update", (req, res) => {
  const shortURL = req.params.id;
  const newLongURL = req.body.newLongURL;
  const user_id = req.session.user_id;
  
  if (!urlDatabase[shortURL] || urlDatabase[shortURL].userID !== user_id) {
    res.status(403).send("<h3>Only the owner of the URL can edit it.</h3>");
  } else {
    urlDatabase[shortURL].longURL = newLongURL;
    res.redirect(`/urls`);
  }
});

app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;
  const data = urlDatabase[shortURL]
  if(!data) {
    res.status(404).send("<h3>Shortened URL does not exist.</h3>");
  } else {
    res.redirect(data.longURL);
  }
});

app.post("/urls/:id/delete", (req, res) => {
  const user_id = req.session.user_id;
  const shortURL = req.params.id;

  if (!urlDatabase[shortURL] || urlDatabase[shortURL].userID !== user_id) {
    res.status(403).send("<h3>Only the owner of the URL can delete it.</h3>");
  } else {
    delete urlDatabase[shortURL];
    res.redirect("/urls");
  }
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}!`);
});