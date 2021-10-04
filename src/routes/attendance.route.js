const attendance = require("../controllers/attendance.controller");

module.exports = (app) => {

    app.post('/attendance', attendance.getAttendance);

};
