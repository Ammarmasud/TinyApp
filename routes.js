const generateRandomString = require('./generateRandomString');
const checkEmails = require('./checkEmails');
const bcrypt = require('bcrypt');

const urlDatabase = {
                    "b2xVn2": "http://www.lighthouselabs.ca",
                    "9sm5xK": "http://www.google.com"
                    };
const users = {'3Bv2hG':{
                  id:'3Bv2hG',
                  email:'test@test.com',
                  password: bcrypt.hashSync('test',10),
                  shortURLs: ["b2xVn2","9sm5xK"]
              }};

module.exports = (app) => {
  app.get("/", (req, res) => {
    res.redirect('/urls');
    // res.end("Hello!");
  });

  app.get("/registration", (req, res) => {
    res.render("urls_register");
  });

  app.post("/registration", (req, res) => {
    if (req.body.email && req.body.password && !(checkEmails(users, req.body.email))) {
      const id = generateRandomString(users);
      users[id] = {'id':id,
                  'email': req.body.email,
                  'password': bcrypt.hashSync(req.body.password, 10),
                  'shortURLs': []};
      req.session.user_id = id;
      res.redirect('/');
    } else {
      res.statusCode = 400;
      res.redirect('/registration');
    }
  });

  // LOGIN
  app.post("/login", (req, res) => {
    let id = checkEmails(users, req.body.email);
    if (id && bcrypt.compareSync(req.body.password, users[id].password)) {
      req.session.user_id = id;
      res.redirect('/');
    } else {
      res.statusCode = 403;
      res.redirect('/login');
    }
  });

  app.get("/login", (req, res) => {
    res.render("urls_login");
  });

  app.post("/logout", (req, res) => {
    req.session = null;
    // res.clearCookie('user_id',req.session.user_id);
    res.redirect('/');
  });

  app.get("/urls/new", (req, res) => {
    let email;
    if (users[req.session.user_id]) {
      email = users[req.session.user_id].email;
      res.render("urls_new",{'email': email});
    } else {
      res.statusCode = 403;
      res.redirect('/login');
    }
  });

  app.post("/urls/:shortURL/delete", (req, res) => {
    let index = users[req.session.user_id].shortURLs.indexOf(req.params.shortURL)
    if (index !== -1) {
      delete urlDatabase[req.params.shortURL];
      users[req.session.user_id].shortURLs.splice(index, 1)
      res.redirect('/urls');
    } else if (users[req.session.user_id]) {
      res.statusCode = 403;
      res.redirect('/urls');
    } else {
      res.statusCode = 403;
      res.redirect('/login');
    }

  });

  app.post("/urls/:shortURL", (req, res) => {
    let index = users[req.session.user_id].shortURLs.indexOf(req.params.shortURL)
    if (index !== -1) {
      urlDatabase[req.params.shortURL] = req.body['longURL'];
      users[req.session.user_id].push
      res.redirect('/urls');
    } else if (users[req.session.user_id]) {
      res.statusCode = 403;
      res.redirect('/urls');
    } else {
      res.statusCode = 403;
      res.redirect('/login');
    }
  });

  app.get("/urls/:shortURL", (req, res) => {
    const templateVars = {'shortURL': req.params.shortURL,
                          'longURL': urlDatabase[req.params.shortURL]};
    if (users[req.session.user_id]) {
      templateVars['email'] = users[req.session.user_id].email;
    }
    res.render('urls_show', templateVars);
  });

  app.post("/urls", (req, res) => {
    if (users[req.session.user_id]) {
      let shortURL = generateRandomString(urlDatabase);
      urlDatabase[shortURL] = req.body['longURL'];
      users[req.session.user_id].shortURLs.push(shortURL);
      res.redirect('/urls');
    }
  });

  app.get("/urls", (req, res) => {
    let email;
    let userURLs = [];
    if (users[req.session.user_id]) {
      email = users[req.session.user_id].email;
      userURLs = users[req.session.user_id].shortURLs;
    }

    const templateVars =  {'urls': urlDatabase,
                          'userURLs': userURLs,
                          'email': email};
    res.render('urls_index', templateVars);
  });

  app.get("/u/:shortURL", (req, res) => {
    if (req.params.shortURL in urlDatabase) {
      let longURL = urlDatabase[req.params.shortURL];
      res.redirect(longURL);
    } else {
      res.statusCode = 404;
      res.redirect('/urls');
    }
  });

  // app.get("/urls.json", (req, res) => {
  //   res.json(urlDatabase);
  // });

  app.get("/hello", (req, res) => {
    res.end("<html><body>Hello <b>World</b></body></html>\n"); //can also use `res.send()`
  });
}