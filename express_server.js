// dependencies
const express = require('express');
const cookieSession = require('cookie-session');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
var methodOverride = require('method-override');

// initiate the App
const app = express();

// default port 8080
const PORT = 8080;

// functions
const helperFunctions = require('./helperFunctions');

// Middlewares
// override with POST having ?_method=DELETE
app.use(cookieParser());
app.use(methodOverride('_method'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  cookieSession({
    name: 'session',
    keys: ['qwertyu', 'ertyui'],

    // Cookie Options
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  })
);

//view engine - ejs
app.set('view engine', 'ejs');

// Database

const databases = require('./databases/database');
const { urlDatabase, users } = databases;

// ============= GET REQUESTS ==================== //

// root route ("/")
app.get('/', (req, res) => {
  const user_id = req.session.user_id;
  if (user_id) {
    res.redirect('/urls');
  } else {
    req.session = null;
    res.redirect('/login');
  }
});

// main urls page
app.get('/urls', (req, res) => {
  const user_id = req.session.user_id;
  const currentUser = users[user_id];
  const usersURLS = helperFunctions.urlsForUser(user_id, urlDatabase);
  const templateVars = {
    user_id,
    currentUser,
    urls: urlDatabase,
    usersURLS,
    users: users
  };
  res.render('urls_index', templateVars);
});

// route to create new urls
app.get('/urls/new', (req, res) => {
  const { user_id } = req.session;
  const currentUser = users[user_id];
  const templateVars = {
    currentUser
  };
  if (currentUser) {
    res.render('urls_new', templateVars);
  } else {
    res.status(401).redirect('/login');
  }
});

// route to redirect shortURLS to longURLS
app.get('/u/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL][shortURL];
  const userCookie = req.session.uniqueUser;
  const now = new Date();
  const isUniqueUser = helperFunctions.isUnique(
    urlDatabase[shortURL].uniqueViews,
    userCookie
  );
  if (longURL) {
    urlDatabase[shortURL].views++;
    if (!isUniqueUser) {
      const random = helperFunctions.randomUrl();
      req.session.uniqueUser = random;
      urlDatabase[shortURL].uniqueViews.push(random);
      let visiter = {
        id: random,
        visitedOn: new Date()
      };
      urlDatabase[shortURL].visiterLog.push(visiter);
    } else {
      let visiter = { id: req.session.uniqueUser, visitedOn: new Date() };
      urlDatabase[shortURL].visiterLog.push(visiter);
    }
    res.status(302).redirect(longURL);
  } else {
    res.status(404).render('404');
  }
});

// Route to update urls
app.get('/urls/:id', (req, res) => {
  const user_id = req.session.user_id;
  const currentUser = users[user_id];
  const shortURL = req.params.id;
  const templateVars = {
    shortURL,
    currentUser,
    urlDatabase,
    users,
    longURL: urlDatabase[shortURL][shortURL]
  };
  if (user_id === urlDatabase[shortURL].userID) {
    res.render('urls_show', templateVars);
  } else {
    res.status(401).send('Not authorized to change others urls');
  }
});

// route to show register page
app.get('/register', (req, res) => {
  res.render('register');
});

// route to show login page
app.get('/login', (req, res) => {
  res.status(200).render('login');
});

// ============= POST REQUESTS ==================== //

// route to add new url
app.post('/urls', (req, res) => {
  const currentUser = req.session.user_id;
  const { longURL } = req.body;
  const random = helperFunctions.randomUrl();
  const newURL = {
    userID: currentUser,
    [random]: longURL,
    views: 0,
    visiterLog: [],
    uniqueViews: []
  };
  urlDatabase[random] = newURL;
  res.status(201).redirect(`/urls`);
});

// route to delete a url
app.delete('/urls/:id/delete', (req, res) => {
  const { id } = req.params;
  const currentUser = req.session.user_id;
  if (currentUser === urlDatabase[id].userID) {
    delete urlDatabase[id];
    res.status(200).redirect('/urls');
  } else {
    res.status(401).send('status : 401 : Not authorized to delte');
  }
});

// route to  update longURL
app.put('/urls/:id', (req, res) => {
  const currentUser = req.session.user_id;
  const { id } = req.params;
  const { editedURL } = req.body;
  if (currentUser === urlDatabase[id].userID) {
    urlDatabase[id][id] = editedURL;
    res.status(200).redirect('/urls');
  } else {
    res.status(401).send('status : 401 :  Not authorized to edit');
  }
});

//  route login a user
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  let user_id;
  for (let key in users) {
    let userPassword = users[key].hashedPassword;
    if (
      users[key].email === email &&
      bcrypt.compareSync(password, userPassword)
    ) {
      user_id = key;
    }
  }
  if (user_id) {
    req.session.user_id = user_id;
    res.status(200).redirect('/');
  } else {
    res.status(403).send('Status : 403 : Invalid username or password');
  }
});

// route to logout a user
app.post('/logout', (req, res) => {
  req.session = null;
  res.status(200).redirect('/');
});

// route to register a user , check if id,email are avialabe ,and email and password fields are not let empty by user .
app.post('/register', (req, res) => {
  const { email, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);
  const user_id = helperFunctions.randomUrl();
  const user = { user_id, email, hashedPassword };
  let emailAvailable;

  for (let key in users) {
    if (users[key].email === email) {
      emailAvailable = false;
    } else {
      emailAvailable = true;
    }
  }

  if (!emailAvailable) {
    res.status(400).send('status: 400 : Email not available');
  }

  if (!email || !password) {
    res.status(400).send('status: 400 : Provide Email and password');
  }

  if (users[user_id]) {
    res.status(400).send('status: 400 : Bad request');
  } else {
    users[user_id] = user;
    req.session.user_id = user_id;
    res.status(201).redirect('/urls');
  }
});

// app listening on default port
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
