// dependencies
const express = require('express');
const cookieSession = require('cookie-session');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
var methodOverride = require('method-override');

// Routes  endpoints
const usersRoutes = require('./routes/users');
const shortUrlsRoutes = require('./routes/shortUrls');
const urlsRoutes = require('./routes/urls');

// initiate the App
const app = express();

// default port 8080
const PORT = 8080;

// Middlewares
app.use('/public', express.static('public'));
app.use(cookieParser());
// override with POST having ?_method=DELETE
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

// USE ROUTS TO HANDLE REQUESTS
app.use('/', usersRoutes);
app.use('/u', shortUrlsRoutes);
app.use('/urls', urlsRoutes);

// app listening on default port
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
