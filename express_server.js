const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require("cookie-parser");
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
  const userUrls = getUrlsByUserId(urlDatabase, user_id);
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
  const templateVars = {id: req.params.id, longURL: urlDatabase[req.params.id], user: user};
  res.render("urls_show", templateVars);
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
  
  const newUser = { // create new user object
    id,
    email,
    password,
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
  const user_id = findUser(email, password); 
  
  if (user_id) { // if user_id == true, login the user
    res.cookie("user_id", user_id);
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
  
  if (urlDatabase[id]) {
    urlDatabase[id].longURL = newLongURL;
    res.redirect(`/urls/${id}`); // Redirect to the updated URL's page
  } else {
    res.status(404).send("<h3>URL does not exist.</h3>");
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
    const shortURL = req.params.id;
    delete urlDatabase[shortURL];
    res.redirect("/urls");
});
  
function getUrlsByUserId(urlDatabase, userId) {
  const filteredUrls = {};
  
  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === userId) {
      filteredUrls[shortURL] = urlDatabase[shortURL];
    }
  }
  
    return filteredUrls;
};

function findUser(email, password) { // function for locating user in object
  for (const user_id in users) {
    if (users[user_id].email === email && users[user_id].password === password) {
      return user_id;
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