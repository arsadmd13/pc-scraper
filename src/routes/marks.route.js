const marks = require("../controllers/marks.controller");

module.exports = (app) => {

    app.post('/marks', marks.getMarks);

};