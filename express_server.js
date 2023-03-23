const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require("cookie-parser");
app.use(cookieParser());


app.set("view engine", "ejs");
app.use(express.urlencoded({extended: true}));

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

app.get("/urls", (req, res) => {
  const username = req.cookies["username"];
  const templateVars = {urls: urlDatabase, username: username};
    
    res.render("urls_index", templateVars);
});

app.get("/hello", (req, res) => {
    const templateVars = {greeting: "Hello World!"};
    res.render("hello_world", templateVars);
});

app.get("/urls/new", (req, res) => {
    res.render("urls_new");
});

app.get("/urls/register", (req, res) => {
  res.render("register");
});


app.get("/urls/:id/", (req, res) => {
    const templateVars = {id: req.params.id, longURL: urlDatabase[req.params.id]};
    res.render("urls_show", templateVars);
});

app.post("/login", (req, res) => {
  const username = req.body.username;

  res.cookie("username", username);

  res.redirect("/urls"); 
});

app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
});


app.post("/register", (req, res) => {
  
  console.log(req.body);

  res.send("Ok"); // Respond with 'Ok' (we will replace this)
});


app.post("/urls", (req, res) => {
    console.log(req.body);
    const shortURL = generateRandomString(); // Log the POST request body to the console
    urlDatabase[shortURL] = req.body.longURL;
    res.send("Ok"); // Respond with 'Ok' (we will replace this)
});

app.post("/urls/:id/update", (req, res) => {
    console.log("Update post request");
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