const request = require('request-promise');
const cheerio = require('cheerio');

var include_headers = function(body, response, resolveWithFullResponse) {
    return {'headers': response.headers, 'data': body};
};

exports.login = async (req, res) => {
    const { username, password } = req.body;
    let options = {
        method: 'POST',
        followAllRedirects: false,
        uri: 'http://118.185.105.250/parent/slogin',
        formData: {
            username,
            password,
            slog: 'Sign In'
        },
        transform: include_headers,
        resolveWithFullResponse: true
    }

    await request(options)
        .then((responseData) => {
            // console.log("Invalid Login!");
            return res.send({
                status: 404,
                message: "Invalid Credentials"
            });
        })
        .catch((err) => {
            if(err.response.headers.location === 'sthome') {
                tempSession = err.response.headers['set-cookie'];
                phpsess = tempSession[0].substring(tempSession[0].indexOf('PHPSESSID=') + 10, tempSession[0].indexOf('; path'))
                console.log("Login Successfull!!!");
                fetchName(phpsess, res);
            } else {
                return res.send({
                    status: 500,
                    message: "Unable to process your request at the moment!"
                });
            }
        })
}

async function fetchName(sessionId, res) {
    var options = {
        method: 'POST',
        followAllRedirects: false,
        uri: 'http://118.185.105.250/parent/sthome',
        headers: {
            "Cookie": "PHPSESSID=" + sessionId
        },
        transform: include_headers, //Experimental
        resolveWithFullResponse: true
    };
    
    await request(options)
      .then(function(html){
        try{
            var $ = cheerio.load(html.data);
            let pageHtml = $('html');
            let name = $(pageHtml).find('.right_col > center > h2:first-of-type').text();
            let firstName = name.split('(')[0].split(' ')[0].split(".")[0];
            firstName = firstName[0] + firstName.substr(1, firstName.length).toLowerCase();
            res.send({
                status: 200,
                message: "Logged in successfully",
                sessionId: phpsess,
                name: name.split('(')[0],
                firstName: firstName,
                initial: firstName[0]
            })
        } catch(err) {
            res.send({
                status: 500,
                message: "Unable to process your request at the moment!"
            });
        }
      })
      .catch(function(err){
          if(err.statusCode === 302 && err.response.headers.location === "slogin.php"){
            res.send({
                status: 403,
                message: "Authentication required!"
            });
          } else {
            res.send({
                status: 500,
                message: "Unable to process your request at the moment!"
            });
          }
      });
}