const express = require('express');
const cookieSession = require('cookie-session');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const router = express.Router();

// import databases
const databases = require('../databases/database');
const { urlDatabase, users } = databases;
// functions
const helperFunctions = require('../helperFunctions');

// all routes in this file will be prpended with  "/"

// -------- GET ROUTES ---------------//

// root route ("/")
//riute : "/"
router.get('/', (req, res) => {
  const user_id = req.session.user_id;
  if (user_id) {
    res.redirect('/urls');
  } else {
    req.session = null;
    res.redirect('/login');
  }
});

// route to show register page
// route : '/register'
router.get('/register', (req, res) => {
  res.render('register');
});

// route to show login page
router.get('/login', (req, res) => {
  res.status(200).render('login');
});

// ============= POST REQUESTS ==================== //
//  route login a user
//route : "/login "
router.post('/login', (req, res) => {
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
// route : "/logout"
router.post('/logout', (req, res) => {
  req.session = null;
  res.status(200).redirect('/');
});

// route to register a user , check if id,email are avialabe ,and email and password fields are not let empty by user .
//route : "/register"
router.post('/register', (req, res) => {
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

module.exports = router;
