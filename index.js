var express = require('express');
var request = require('request');
var moment = require('moment');
var logfmt = require('logfmt');
var Promise = require('promise');

var app = express();
var port = Number(process.env.PORT || 2369);

var server = app.listen(port, function() {
  return console.log('Listening on port ' + port);
});

var getRandomNumber = function() {
  return Math.floor(Math.random() * 10);
};

var getRandomToken = function() {
  return ['F57', getRandomNumber(), getRandomNumber(), '61F-8AA4-4626-969A-B48A0659B2DF'].join('');
};

var getUrl = function(stop, route) {
  route = route || 0;
  return "http://ws3.tramtracker.com.au/TramTracker/restservice/GetNextPredictedRoutesCollection/" + stop + "/" + route + "/false/?aid=TTIOSJSON&cid=2&tkn=" + getRandomToken();
};

var parseDateString = function(string) {
  var matches;
  matches = string.match(/\/Date\((\d+)\+\d+\)\//);
  return moment(Number(matches[1]));
};

var getTimes = function(stop, route, title, footer) {
  return new Promise(function(resolve, reject){
    console.log(getUrl(stop, route));
    request(getUrl(stop, route), function(apiError, apiResponse, apiBody) {
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
      })().map(function(routeTime) {
        return routeTime.string;
      }).join(', ');

      resolve({
        fallback: title + ': ' + results,
        color: "#bcd531",
        title: title,
        text: results,
        footer: footer
      });

    });
  });
};

app.use(logfmt.requestLogger());

app.post('/ferocia', function(req, res) {
  Promise.all([
    getTimes(1395, 12, 'Route 12', 'Stop 128 - To City - Corner of Dorcas & Clarendon'),
    getTimes(1532, 96, 'Route 96', 'Stop 127 - To City - South Melbourne Markets')
  ]).then(function(results) {
    res.send({
      attachments: results
    });
  });
});

app.get('/stop/:stop/:route', function(req, res) {
  return getTimes(parseInt(req.params.stop), parseInt(req.params.route)).then(function(results) {
    return res.send(results);
  });
});

app.get('/', function(req, res){
  res.send('Hello!');
});

app.use(function(err, req, res, next) {
  console.error(err.stack);
  return res.send(500, 'Error 500');
});
