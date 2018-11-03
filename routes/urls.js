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

// all routes in this file will be prpended with  "/urls"

// ============= GET REQUESTS ==================== //

// main urls page
// route : "/urls"
router.get('/', (req, res) => {
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
// route : '/urls/new'
router.get('/new', (req, res) => {
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

// Route to update urls
// route : '/urls/:id'
router.get('/:id', (req, res) => {
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

// ============= POST REQUESTS ==================== //

// route to add new url
// route : '/urls'
router.post('/', (req, res) => {
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
//router : '/urls/:id/delete'
router.delete('/:id/delete', (req, res) => {
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
// route :'/urls/:id'
router.put('/:id', (req, res) => {
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

module.exports = router;
