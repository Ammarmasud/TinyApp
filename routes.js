const generateRandomString = require('./generateRandomString');
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

module.exports = (app) => {
  app.get("/", (req, res) => {
    res.redirect('/urls');
    // res.end("Hello!");
  });

  app.get("/urls/new", (req, res) => {
    res.render("urls_new");
  });

  app.post("/urls/:id/delete", (req, res) => {
    delete urlDatabase[req.params.id];
    res.redirect('/urls');
  });

  app.post("/urls/:id", (req, res) => {
    urlDatabase[req.params.id] = req.body['longURL'];
    res.redirect('/urls');
  });

  app.get("/urls/:id", (req, res) => {
    const templateVars = {  shortURL: req.params.id,
                            longURL: urlDatabase[req.params.id]};
    res.render('urls_show', templateVars);
  });

  app.post("/urls", (req, res) => {
    let shortURL = generateRandomString();
    urlDatabase[shortURL] = req.body['longURL'];
    res.redirect('/urls');
  });

  app.get("/urls", (req, res) => {
    const templateVars = { urls: urlDatabase};
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