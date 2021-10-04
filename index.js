const express = require('express');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.json("5mb"));

require("./src/routes/attendance.route")(app);
require("./src/routes/auth.route")(app);
require("./src/routes/marks.route")(app);

app.listen(process.env.PORT || 3000, ()  => {
    console.log("Scraper is up and running!");
})