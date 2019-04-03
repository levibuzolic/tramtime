const request = require('request');
const moment = require('moment');

function randomNumber() {
  return Math.floor(Math.random() * 9.99);
}

function randomToken() {
  return `F57${randomNumber()}${randomNumber()}61F-8AA4-4626-969A-B48A0659B2DF`;
}

function getUrl(stop, route) {
  route = route || 0;
  return `http://ws3.tramtracker.com.au/TramTracker/restservice/GetNextPredictedRoutesCollection/${stop}/${route}/false/?aid=TTIOSJSON&cid=2&tkn=${randomToken()}`;
}

function parseDateString(string) {
  const matches = string.match(/\/Date\((\d+)\+\d+\)\//);
  return moment(Number(matches[1]));
}

function getTimes(stop, route, title, footer) {
  return new Promise((resolve, reject) => {
    console.log(getUrl(stop, route));
    request(getUrl(stop, route), (apiError, apiResponse, apiBody) => {
      var arrivalTime, json, minutes, number, results, string, time, timeResponded, times;
      json = JSON.parse(apiBody);
      timeResponded = parseDateString(json.timeResponded);
      times = json.responseObject || [];
      results = (function() {
        var i, len, results1;
        results1 = [];
        for (i = 0, len = times.length; i < len; i++) {
          time = times[i];
          arrivalTime = parseDateString(time.PredictedArrivalDateTime);
          number = time.RouteNo;
          minutes = (arrivalTime - timeResponded) / 1000 / 60;
          string = arrivalTime.from(timeResponded, true);
          results1.push({
            number: number,
            minutes: minutes,
            string: string
          });
        }
        return results1;
      })().map(routeTime => routeTime.string).join(', ');

      resolve({
        fallback: `${title}: ${results}`,
        color: "#bcd531",
        title: title,
        text: results,
        footer: footer
      });

    });
  });
}

module.exports = (req, res) => {
  res.setHeader('content-type', 'application/json');
  Promise.all([
    getTimes(1395, 12, 'Route 12', 'Stop 128 - To City - Corner of Dorcas & Clarendon'),
    getTimes(1532, 96, 'Route 96', 'Stop 127 - To City - South Melbourne Market')
  ]).then(attachments => {
    res.end(JSON.stringify({attachments}));
  }).catch(error => {
    console.error(error);
  });
}
