const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require('body-parser');

// Middlewares
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

const randomUrls = require('./generateRandomString');

//view engine - ejs
app.set('view engine', 'ejs');

var urlDatabase = {
  b2xVn2: 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
};
const users = {
  1: {
    id: '1',
    email: 'user1@example.com',
    password: 'monkey'
  },
  2: {
    id: '2',
    email: 'user2@example.com',
    password: 'funk'
  }
};

// ============= GET REQUESTS ==================== //

app.get('/', (req, res) => {
  res.send('Hello!');
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/urls', (req, res) => {
  let user_id = req.cookies['user_id'];
  let user = users[user_id];
  console.log({ user_id, user }, users);
  let templateVars = {
    urls: urlDatabase,
    user_id,
    user
  };
  res.render('urls_index', templateVars);
});
app.get('/urls/new', (req, res) => {
  res.render('urls_new');
});

app.get('/u/:shortURL', (req, res) => {
  let shortURL = req.params.shortURL;
  let longURL = urlDatabase[shortURL];
  if (longURL) res.status(302).redirect(longURL);
  else res.status(404).send('status: 404 : Requested path not found');
});

app.get('/urls/:id', (req, res) => {
  let user_id = req.cookies['user_id'];
  let user = users[user_id];
  let templateVars = {
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id],
    user_id,
    user
  };
  res.render('urls_show', templateVars);
});

app.get('/register', (req, res) => {
  res.render('register');
});

app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World</b></body></html>\n');
});

// ============= POST REQUESTS ==================== //

app.post('/urls', (req, res) => {
  //console.log(req.body);
  let { longURL } = req.body; // debug statement to see POST parameters
  let random = randomUrls.randomUrl();
  urlDatabase[random] = longURL;
  res.status(201).redirect(`/urls/${random}`); // Respond with 'Ok' (we will replace this)
});

app.post('/urls/:id/delete', (req, res) => {
  let { id } = req.params;
  if (urlDatabase[id]) {
    delete urlDatabase[id];
    res.status(200).redirect('/urls');
  } else {
    res.status(404).send('status : 404 : resourse not found');
  }
});

// update longURL
app.post('/urls/:id', (req, res) => {
  const { id } = req.params;
  const { editedURL } = req.body;
  urlDatabase[id] = editedURL;
  res.status(200).redirect('/urls');
});

// login
app.post('/login', (req, res) => {
  //let { user_id } = req.body;
  let user_id = randomUrls.randomUrl();
  res.cookie('user_id', user_id);
  res.status(200).redirect('/urls');
});

// logout
app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.status(200).redirect('/urls');
});

// register
app.post('/register', (req, res) => {
  const { email, password } = req.body;
  const user_id = randomUrls.randomUrl();
  const user = { user_id, email, password };
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
    console.log(users);
    res.cookie('user_id', user_id);
    console.log('good');
    console.log(users);
    res.status(201).redirect('/urls');
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
