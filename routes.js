const generateRandomString = require('./generateRandomString');
const checkEmails = require('./checkEmails');
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
const users = {'3Bv2hG':{id:'3Bv2hG',email:'test@test.com',password:'test'}};

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
      const id = generateRandomString();
      users[id] = {'id':id,
                  'email': req.body.email,
                  'password': req.body.password};
      res.cookie('user_id',id);
      res.redirect('/');
    } else {
      res.statusCode = 400;
      res.redirect('/registration');
    }
  });

  // LOGIN
  app.post("/login", (req, res) => {
    let id = checkEmails(users, req.body.email)
    if (id && users[id].password === req.body.password) {
      res.cookie('user_id',id);
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
    let id = req.cookies.user_id
    res.clearCookie('user_id',id);
    res.redirect('/');
  });

  app.get("/urls/new", (req, res) => {
    let email;
    if (req.cookies.user_id) {
      email = users[req.cookies.user_id].email;
    }
    res.render("urls_new",email);
  });

  app.post("/urls/:shortURL/delete", (req, res) => {
    delete urlDatabase[req.params.shortURL];
    res.redirect('/urls');
  });

  app.post("/urls/:shortURL", (req, res) => {
    urlDatabase[req.params.shortURL] = req.body['longURL'];
    res.redirect('/urls');
  });

  app.get("/urls/:shortURL", (req, res) => {
    const templateVars = {'shortURL': req.params.shortURL,
                          'longURL': urlDatabase[req.params.shortURL],
                          'email': users[req.cookies.user_id].email};
    res.render('urls_show', templateVars);
  });

  app.post("/urls", (req, res) => {
    let shortURL = generateRandomString();
    urlDatabase[shortURL] = req.body['longURL'];
    res.redirect('/urls');
  });

  app.get("/urls", (req, res) => {
    let email;
    if (req.cookies.user_id) {
      email = users[req.cookies.user_id].email;
    }
    const templateVars =  {'urls': urlDatabase,
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

  app.get("/urls.json", (req, res) => {
    res.json(urlDatabase);
  });

  app.get("/hello", (req, res) => {
    res.end("<html><body>Hello <b>World</b></body></html>\n"); //can also use `res.send()`
  });
}