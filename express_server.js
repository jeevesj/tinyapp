const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");
app.use(cookieParser());


app.set("view engine", "ejs");
app.use(express.urlencoded({extended: true}));

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};


const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};


app.get("/", (req, res) => {
    res.send("Hello!");
});

app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
    res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
    res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const user_id = req.cookies["user_id"];
  const user = users[user_id];
  if (!user) {
    res.status(401).send("<h3>You must be logged in to view.</h3>");
  } else {
  const userUrls = urlsforUser(urlDatabase, user_id);
  const templateVars = { urls: userUrls, user: user };
  res.render("urls_index", templateVars);
  }
});

app.get("/hello", (req, res) => {
    const templateVars = {greeting: "Hello World!"};
    res.render("hello_world", templateVars);
});

app.get("/urls/new", (req, res) => {
  const user_id = req.cookies["user_id"];
  const user = users[user_id];
  if (!user) { // checks cookie and redirects user to /urls if logged in
    res.redirect('/login');
  } else {
    const templateVars = { user: user };
    res.render("urls_new", templateVars);
  }
});

app.get("/urls/:id/", (req, res) => {
  const user_id = req.cookies["user_id"];
  const user = users[user_id];
  if (!user) {
    res.status(401).send("<h3>You must be logged in to view</h3>");
  } else if (!urlDatabase[shortURL] || urlDatabase[shortURL].userID !== user_id) {
    res.status(403).send("<h3>You do not have permission to view</h3>");
  } else {
    const templateVars = { id: shortURL, longURL: urlDatabase[shortURL].longURL, user: user };
    res.render("urls_show", templateVars);
  }
});

app.get('/register', (req, res) => {
  const user_id = req.cookies["user_id"]; // Get the user_id from the cookies
  const user = users[user_id]; 
  if (user_id) { // checks cookie and redirects user to /urls if logged in
    res.redirect('/urls');
  } else {
  const templateVars = { user: user };
  res.render('register', templateVars);
  }
});

app.get('/login', (req, res) => {
  const user_id = req.cookies["user_id"]; // Get the user_id from the cookies
  const user = users[user_id];
  if (user_id) { // checks cookie and redirects user to /urls if logged in
    res.redirect('/urls');
  } else {
  const templateVars = { user: user };
  res.render('login', templateVars);
  }
});


app.post("/register", (req, res) => { 
  const id = generateRandomString(); // generate random string for ID
  const email = req.body.email; // email from form
  const password = req.body.password; // password from form 
  const hashedPassword = bcrypt.hashSync(password, 10);
  
  const newUser = { // create new user object
    id,
    email,
    password: hashedPassword,
  };

  if (!email || !password) { // check if email or password left blank
    res.status(400).send('Email and password are required'); // 400 message
    return;
  }
  for (const userID in users) { // check if users email exists already
    if (users[userID].email === email) {
      res.status(400).send('Email already exists');  // 400 message
      return;
    }
  }

  users[id] = newUser; // add newUser to object
  console.log(newUser); // print newUser to check
  res.cookie("user_id", id); // assign user a cookie
  res.redirect("/urls");  // redirect to url
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const userInfo = findUser(email); 
  if (!userInfo) {
    res.status(403).send("Email not found."); // error 403
    return;
  }
  if (bcrypt.compareSync(password, userInfo.password)) { // if user_id == true, login the user
    res.cookie("user_id", userInfo.id);
    res.redirect("/urls");
  } else {
    res.status(403).send("Email or password do not match. Please try again."); // error 403
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id"); // deletes cookie in browser
  res.redirect("/login"); // redirects to login page after logging out
});

app.post("/urls", (req, res) => {
  const user_id = req.cookies["user_id"];
  const user = users[user_id];

  if (!user) {
    res.status(401).send("<h3>You must be logged in to shorten URLs.</h3>");
  } else {
    const shortURL = generateRandomString();
    const longURL = req.body.longURL;
    urlDatabase[shortURL] = {
       longURL: req.body.longURL, 
       userID: user_id 
    };
    res.redirect(`/urls/${shortURL}`);
  }
});

app.post("/urls/:id/update", (req, res) => {
  console.log("Update post request");
  const id = req.params.id;
  const newLongURL = req.body.newLongURL;
  
  if (!urlDatabase[shortURL] || urlDatabase[shortURL].userID !== user_id) {
    res.status(403).send("<h3>Only the owner of the URL can edit it.</h3>");
  } else {
    urlDatabase[shortURL].longURL = newLongURL;
    res.redirect(`/urls/${shortURL}`);
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
  const user_id = req.cookies["user_id"];
  const shortURL = req.params.id;

  if (!urlDatabase[shortURL] || urlDatabase[shortURL].userID !== user_id) {
    res.status(403).send("<h3>Only the owner of the URL can delete it.</h3>");
  } else {
    delete urlDatabase[shortURL];
    res.redirect("/urls");
  }
});

function urlsforUser(urlDatabase, userId) {
  const filteredUrls = {};

  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === userId) {
      filteredUrls[shortURL] = urlDatabase[shortURL];
    }
  }
    return filteredUrls;
};

function findUser(email) { 
  for (const user_id in users) {
    if (users[user_id].email === email) {
      return users[user_id];
    }
  }
  return null;
}


function generateRandomString() { //generate 6 random chars
  let result = '';
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};