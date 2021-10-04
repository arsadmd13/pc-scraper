const request = require('request-promise');
const cheerio = require('cheerio');

exports.getMarks = async (req, res) => {
    const { semester, cycleTest, sessionId } = req.body;
    let options = {
        method: 'POST',
        followAllRedirects: false,
        uri: 'http://118.185.105.250/parent/mark_view',
        formData: {
            semester,
            test: cycleTest,
            susubmit: ''
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
            let marks = [];
            $('#univmark > tbody > tr').each(function (index, element) {
                let tempObj = {};
                for(let i = 1; i < 6; i++) {
                    // console.log($(this).find(`td:nth-of-type(${i})`).text());
                    if(i == 1) {
                        tempObj['subjectCode'] = $(this).find(`td:nth-of-type(${i})`).text().trim();
                    } else if(i == 2) {
                        tempObj['subjectName'] = $(this).find(`td:nth-of-type(${i})`).text().trim();
                    } else if(i == 3) {
                        tempObj['assignmentMark'] = $(this).find(`td:nth-of-type(${i})`).text().trim();
                    } else if(i == 4) {
                        tempObj['examMark'] = $(this).find(`td:nth-of-type(${i})`).text().trim();
                    } else if(i == 5) {
                        tempObj['status'] = $(this).find(`td:nth-of-type(${i})`).text().trim();
                    }
                }

                if(!isNaN(Number.parseInt(tempObj['assignmentMark'])) && !isNaN(Number.parseInt(tempObj['examMark']))) {
                    tempObj['totalMark'] = Number.parseInt(tempObj['assignmentMark']) + Number.parseInt(tempObj['examMark']);
                } else if(isNaN(Number.parseInt(tempObj['assignmentMark'])) && !isNaN(Number.parseInt(tempObj['examMark']))) {
                    tempObj['totalMark'] = Number.parseInt(tempObj['examMark']);
                } else if(!isNaN(Number.parseInt(tempObj['assignmentMark'])) && isNaN(Number.parseInt(tempObj['examMark']))) {
                    tempObj['totalMark'] = Number.parseInt(tempObj['assignmentMark']);
                } else {
                    tempObj['totalMark'] = '-'
                }
                marks.push(tempObj);
            })
            // console.log(marks)
            if(marks.length === 0) {
                res.send({
                    status: 404,
                    message: "Data not found"
                })
            } else {
                res.send({
                    status: 200,
                    message: "Data fetched",
                    data: marks
                })
            }
        })
        .catch((err) => {
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
        })
}