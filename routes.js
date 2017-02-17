const generateRandomString = require('./generateRandomString');
const checkEmails = require('./checkEmails');
const bcrypt = require('bcrypt');
const fs = require('fs');

const urlDatabase = {
                    "b2xVn2": {'longURL':"http://www.lighthouselabs.ca",
                              'visits':0,
                              'uniqueVisits':0,
                              'visitors':[]},
                    "9sm5xK": {'longURL':"http://www.google.com",
                              'visits':0,
                              'uniqueVisits':0,
                              'visitors':[]}
                    };
const users = {'3Bv2hG':{
                  id:'3Bv2hG',
                  email:'test@test.com',
                  password: bcrypt.hashSync('test',10),
                  shortURLs: ["b2xVn2","9sm5xK"]
              }};

module.exports = (app) => {
  // Main page is a redirect to urls
  app.get("/", (req, res) => {
    if (users[req.session.user_id]) {
      res.redirect('/urls');
    } else {
      res.redirect('/login');
    }
  });

  // Registration
  app.get("/registration", (req, res) => {
    if (users[req.session.user_id]) {
      res.redirect('/');
    } else {
      res.render("urls_register");
    }
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
    } else if (req.body.email && req.body.password && checkEmails(users, req.body.email)) {
      res.status(400).send(`<h1>400 Error: </h1><p>Email already exists.</p><a href='/registration'>Try registering again.</a>`);
    } else {
      res.status(400).send(`<h1>400 Error: </h1><p>Left field blank.</p><a href='/registration'>Try registering again.</a>`);
    }
  });

  // LOGIN
  app.post("/login", (req, res) => {
    let id = checkEmails(users, req.body.email);
    if (id && bcrypt.compareSync(req.body.password, users[id].password)) {
      req.session.user_id = id;
      res.redirect('/');
    } else {
      res.status(401).send(`<h1>401 Error: </h1><p>Incorrect username of password.</p><a href='/login'>Click here to head to try again.</a>`);
    }
  });

  app.get("/login", (req, res) => {
    if (users[req.session.user_id]) {
      res.redirect('/');
    } else {
      res.render("urls_login");
    }
  });

  // Logging out
  app.delete("/logout", (req, res) => {
    req.session = null;
    res.redirect('/');
  });

  // page to add (create) a new short url
  app.get("/urls/new", (req, res) => {
    let email;
    if (users[req.session.user_id]) {
      email = users[req.session.user_id].email;
      res.render("urls_new",{'email': email});
    } else {
      res.status(401).send(`<h1>401 Error: </h1><p>Not logged in.</p><a href='/login'>Click here to login</a>`);
    }
  });

  // Delete a short url
  app.delete("/urls/:shortURL/delete", (req, res) => {
    let index = users[req.session.user_id].shortURLs.indexOf(req.params.shortURL)
    if (index !== -1) {
      delete urlDatabase[req.params.shortURL];
      users[req.session.user_id].shortURLs.splice(index, 1)
      res.redirect('/urls');
    } else if (users[req.session.user_id]) {
      res.status(403);
      res.redirect('/urls');
    } else {
      res.status(403);
      res.redirect('/login');
    }

  });

  // Update a short url redirect
  app.put("/urls/:shortURL", (req, res) => {
    let shortURL = req.params.shortURL;
    let index = users[req.session.user_id].shortURLs.indexOf(shortURL);
    if (!(urlDatabase[shortURL])) {
      res.status(404).send(`<h1>404 Error: </h1><p>The short URL used doesn't exist.</p><a href='/'>Click here to head to the homepage.</a>`);
    } else if (index !== -1) {
      urlDatabase[shortURL].longURL = req.body.longURL;
      res.redirect('/urls');
    } else if (users[req.session.user_id]) {
      res.status(403).send(`<h1>403 Error: </h1><p>Not your short URL.</p>`);
    } else {
      res.status(401).send(`<h1>401 Error: </h1><p>Not logged in.</p><a href='/login'>Click here to login</a>`);
    }
  });

  // Show url redirect
  app.get("/urls/:shortURL", (req, res) => {
    let shortURL = req.params.shortURL;
    if (!(urlDatabase[shortURL])) {
      res.status(404).send(`<h1>404 Error: </h1><p>The short URL used doesn't exist.</p><a href='/'>Click here to head to the homepage.</a>`);
    }
    // Not logged in
    if (users[req.session.user_id] && users[req.session.user_id].shortURLs.indexOf(shortURL) !== -1) {
      const templateVars = {'shortURL': shortURL,
                            'longURL': urlDatabase[req.params.shortURL].longURL,
                            'email': users[req.session.user_id].email,
                            'visitors': urlDatabase[req.params.shortURL].visitors};
      res.render('urls_show', templateVars);
    } else if (users[req.session.user_id] && users[req.session.user_id].shortURLs.indexOf(shortURL) === -1) {
      res.status(403).send(`<h1>403 Error: </h1><p>Not your short URL.</p><a href='/urls'>Click here to go back to your urls page.</a>`);
    } else {
      res.status(401).send(`<h1>401 Error: </h1><p>Not logged in.</p><a href='/login'>Click here to login</a>`);
    }

  });

  // Create new short url
  app.post("/urls", (req, res) => {
    if (users[req.session.user_id]) {
      let shortURL = generateRandomString(urlDatabase);
      urlDatabase[shortURL] = {'longURL':req.body.longURL,
                              'visits':0,
                              'uniqueVisits':0,
                              'visitors':[]};
      urlDatabase[shortURL].longURL = req.body.longURL;
      users[req.session.user_id].shortURLs.push(shortURL);
      res.redirect(`/urls/${shortURL}`);
    } else {
      res.status(401).send(`<h1>401 Error: </h1><p>Not logged in.</p><a href='/login'>Click here to login</a>`)
    }
  });

  // urls list
  app.get("/urls", (req, res) => {
    if (users[req.session.user_id]) {
      const templateVars =  {'urls': urlDatabase,
                            'userURLs': users[req.session.user_id].shortURLs,
                            'email': users[req.session.user_id].email};
      res.render('urls_index', templateVars);
    } else {
      res.status(401).send(`<h1>401 Error: </h1><p>Not logged in.</p><a href='/login'>Click here to login</a>`)
    }
  });

  // short url redirect
  app.get("/u/:shortURL", (req, res) => {
    if (req.params.shortURL in urlDatabase) {
      let longURL = urlDatabase[req.params.shortURL].longURL;
      urlDatabase[req.params.shortURL].visits += 1;
      let identifier;

      // check if user already has a user id cookie
      if (req.session.user_id) {
        identifier = req.session.user_id;
      } else if (req.session.visitor_id) {
        identifier = req.session.visitor_id;
      } else {
        const id = generateRandomString(users);
        req.session.visitor_id = id;
        users[id] = {id:id,
                    email:id,
                    password: bcrypt.hashSync(id,10),
                    shortURLs: []};
        identifier = id;
      }
      urlDatabase[req.params.shortURL].visitors.push([new Date(),identifier]);
      res.redirect(longURL);
    } else {
      res.status(401).send(`<h1>404 Error: </h1><p>The short URL doesn't exist.</p><a href='/'>Click here to go to the home page</a>`)
    }
  });

  app.get("/urls.json", (req, res) => {
    res.json(urlDatabase);
  });
}