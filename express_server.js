const express = require("express");
var cookieParser = require('cookie-parser');

const app = express();
const PORT = 3000; // default port 8080

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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

// app.get("/urls", (req, res) => {
//   const templateVars = { urls: urlDatabase };
//   res.render("urls_index", templateVars);
// });

app.get("/hello", (req, res) => {
  const templateVars = { greeting: "Hello World!" };
  res.render("hello_world", templateVars);
});


app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: "http://www.lighthouselabs.ca" };
  res.render("urls_show", templateVars);
});

app.post("/urls/new", (req, res) => {
  console.log(req.body);
  const shortURL = generateRandomString(); // Log the POST request body to the console
  urlDatabase[shortURL] = req.body.newLongURL; 
  res.send("Ok"); // Respond with 'Ok' (we will replace this)
});


app.post("/login", (req, res) => {
  res.cookie('username', req.body.username);
  res.redirect('/urls');
});

app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
});


app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

//middleware
app.use(cookieParser());

app.get("/urls", (req, res) => {
  const templateVars = {
    username: req.cookies["username"],
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
});


app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  const newLongURL = req.body.newLongURL;

  if (urlDatabase[id]) {
    urlDatabase[id] = newLongURL;
    res.redirect(`/urls/${id}`); // Redirect to the updated URL's page
  }
});

app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;
  const longURL = urlDatabase[shortURL]
  res.redirect(longURL);
});

app.post("/urls/:id/delete", (req, res) => {
  const shortURL = req.params.id;
  delete urlDatabase[shortURL];
  res.send("Poof");
});

function generateRandomString() {
  let result = '';
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
  //generate 6 random chars
};