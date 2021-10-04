const request = require('request-promise');
const cheerio = require('cheerio');

exports.getAttendance = async (req, res) => {
    const { date, sessionId } = req.body;
    let options = {
        method: 'POST',
        followAllRedirects: false,
        uri: 'http://118.185.105.250/parent/attendance',
        formData: {
            dat: date,
        },
        headers: {
            "Cookie": "PHPSESSID=" + sessionId
        },
        transform: function(body, response, resolveWithFullResponse) {
            return {'headers': response.headers, 'data': body};
        },
        resolveWithFullResponse: true
    }

    await request(options)
        .then((responseData) => {
            let $ = cheerio.load(responseData.data);
            let hours = [];
            $('.table-responsive.fd > table > tbody > tr > td').each(function (i, e) {
                // console.log($(this).text())
                if($(this).text().length === 0) return;
                if($(this).text().includes("PR")) {
                    hours[i] = "PR"
                } else if($(this).text().includes("AB")) {
                    hours[i] = "AB";
                } else if($(this).text().includes("NA")) {
                    hours[i] = "NA";
                } else if($(this).text().includes("OD")) {
                    hours[i] = "OD";
                } else {
                    hours[i] = "UN";
                }
            });
            return res.send({
                status: 200,
                message: "Data fetched",
                data: hours
            })
        })
        .catch((err) => {
            if(err.statusCode === 302 && err.response.headers.location === "slogin.php"){
                return res.send({
                    status: 403,
                    message: "Authentication required!"
                });
            } else {
                return res.send({
                    status: 500,
                    message: "Unable to process your request at the moment!"
                });
            }
        })
}