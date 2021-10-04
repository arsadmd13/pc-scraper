const auth = require("../controllers/auth.controller");

module.exports = (app) => {

    app.post('/login', auth.login);

};
