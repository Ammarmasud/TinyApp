const routes = require('./routes')
const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080; // default port 8080
const bodyParser = require("body-parser");


app.set("view engine", "ejs");
// app.set('port', PORT); // If we wanted to use an internal port

// Attach middleware
// app.use(bodyParser.json()); // Parse form submissions in multiple formats
app.use(bodyParser.urlencoded({extended: true}));

routes(app);

// Listening for call. Can use `app.get('port')` instead of PORT variable
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

module.exports = app;