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

const urlDatabase = {
  b2xVn2: {
    userID: '1',
    b2xVn2: 'http://www.lighthouselabs.ca'
  },
  '9sm5xK': {
    userID: '2',
    '9sm5xK': 'http://www.google.com'
  },
  XXXxxx: {
    userID: '3',
    XXXxxx: 'http://www.ravraw.io'
  }
};

const users = {
  '1': {
    id: '1',
    email: 'user1@example.com',
    password: 'monkey'
  },
  '2': {
    id: '2',
    email: 'user2@example.com',
    password: 'funk'
  },
  '3': {
    id: '3',
    email: 'r@r.com',
    password: 'ravraw'
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
  let user_id = req.cookies.user_id;
  let currentUser = users[user_id];
  let templateVars = {
    user_id,
    currentUser,
    urls: urlDatabase,
    users: users
  };
  //console.log(templateVars);
  res.render('urls_index', templateVars);
});
app.get('/urls/new', (req, res) => {
  const { user_id } = req.cookies;
  const currentUser = users[user_id];
  //console.log('cookie:', req.cookies);
  //console.log(urlDatabase);
  let templateVars = {
    currentUser
  };
  if (currentUser) {
    res.render('urls_new', templateVars);
  } else {
    res.status(401).redirect('/login');
  }
});

app.get('/u/:shortURL', (req, res) => {
  let shortURL = req.params.shortURL;
  let longURL = urlDatabase[shortURL];
  if (longURL) res.status(302).redirect(longURL);
  else res.status(404).send('status: 404 : Requested path not found');
});

app.get('/urls/:id', (req, res) => {
  let currentUser = req.cookies['user_id'];
  let shortURL = req.params.id;
  //let user = users[user_id];
  //console.log(user);
  let templateVars = {
    shortURL,
    longURL: urlDatabase[shortURL][shortURL],
    currentUser,
    users
  };
  res.render('urls_show', templateVars);
});

app.get('/register', (req, res) => {
  res.render('register');
});

app.get('/login', (req, res) => {
  res.status(200).render('login');
});

app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World</b></body></html>\n');
});

// ============= POST REQUESTS ==================== //

// add new url
app.post('/urls', (req, res) => {
  let currentUser = req.cookies.user_id;
  let { longURL } = req.body;
  let random = randomUrls.randomUrl();
  let newURL = {
    userID: currentUser,
    [random]: longURL
  };
  urlDatabase[random] = newURL;
  res.status(201).redirect(`/urls`); // Respond with 'Ok' (we will replace this)
});

// delete url
app.post('/urls/:id/delete', (req, res) => {
  let { id } = req.params;
  let currentUser = req.cookies.user_id;
  console.log(req.cookies.user_id);
  if (currentUser === urlDatabase[id].userID) {
    console.log('Delete working !!!!!');
    delete urlDatabase[id];
    res.status(200).redirect('/urls');
  } else {
    res.status(401).send('status : 401 : Not authorized to delte');
  }
});

// update longURL
app.post('/urls/:id', (req, res) => {
  const currentUser = req.cookies.user_id;
  const { id } = req.params;
  const { editedURL } = req.body;
  if (currentUser === urlDatabase[id].userID) {
    console.log('Edit working!!!!!');
    urlDatabase[id][id] = editedURL;
    res.status(200).redirect('/urls');
  } else {
    res.status(401).send('status : 401 :  Not authorized to edit');
  }
});

// login
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  let user_id;
  for (let key in users) {
    //console.log('From Login :', users[key].email, users[key].password);
    if (users[key].email === email && users[key].password === password) {
      user_id = key;
    }
  }
  if (user_id) {
    res.cookie('user_id', user_id);
    res.status(200).redirect('/');
  } else {
    res.status(403).send('Status : 403 : Invalid username or password');
  }
});

// logout
app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.status(200).redirect('/');
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
    //console.log(users);
    res.cookie('user_id', user_id);
    // console.log('good');
    // console.log(users);
    res.status(201).redirect('/urls');
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
