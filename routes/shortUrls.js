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

// all routes in this file will be prpended with  "/u"

// -------- GET ROUTES ---------------//
// route to redirect shortURLS to longURLS
// route : '/u/:shortURL'
router.get('/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL][shortURL];
  const userCookie = req.session.uniqueUser;
  const now = new Date();
  const isUniqueUser = helperFunctions.isUnique(
    urlDatabase[shortURL].uniqueViews,
    userCookie
  );
  if (longURL) {
    ++urlDatabase[shortURL].views;
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

module.exports = router;
