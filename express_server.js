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
  const templateVars = { urls: urlDatabase, user: user };

  res.render("urls_index", templateVars);
});

app.get("/hello", (req, res) => {
    const templateVars = {greeting: "Hello World!"};
    res.render("hello_world", templateVars);
});

app.get("/urls/new", (req, res) => {
  const user_id = req.cookies["user_id"];
  const user = users[user_id];
  const templateVars = { user: user };
  res.render("urls_new", templateVars);
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
  const templateVars = { user: user };
  res.render('register', templateVars);
});

app.get('/login', (req, res) => {
  const user_id = req.cookies["user_id"]; // Get the user_id from the cookies
  const user = users[user_id];
  const templateVars = { user: user };
  res.render('login', templateVars);
});


app.post("/register", (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.email;
  
  const newUser = {
    id,
    email,
    password,
  };

  if (!email || !password) {
    res.status(400).send('Email and password are required');
    return;
  }
  for (const userID in users) {
    if (users[userID].email === email) {
      res.status(400).send('Email already exists');
      return;
    }
  }

  users[id] = newUser;
  
  res.cookie("user_id", id);
  res.redirect("/urls"); 
});

function findUser(email, password) {
  //function for locating user in object
  for (const user_id in users) {
    if (users[user_id].email === email && users[user_id].password === password) {
      return user_id;
    }
  }
  return null;
}


app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user_id = findUser(email, password); 

  if (user_id) {
    res.cookie("user_id", user_id);
    res.redirect("/urls");
  } else {
    res.status(403).send("Email or password do not match. Please try again.");
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/login");
});


// app.post("/register", (req, res) => {
  
//   console.log(req.body);

//   res.send("Ok"); // Respond with 'Ok' (we will replace this)
// });


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
    res.redirect("/urls");
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