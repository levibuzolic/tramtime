var express = require('express');
var request = require('request');
var moment = require('moment');
var logfmt = require('logfmt');
var Promise = require('promise');

var app = express();
var port = Number(process.env.PORT || 4000);

var server = app.listen(port, function() {
  return console.log('Listening on port ' + port);
});

var getRandomNumber = function() {
  return Math.floor(Math.random() * 10);
};

var getRandomToken = function() {
  return ['F57', getRandomNumber(), getRandomNumber(), '61F-8AA4-4626-969A-B48A0659B2DF'].join();
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

var getTimes = function(stop, route, callback) {
  return new Promise(function(resolve, reject){
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

      resolve("*Route "+route+":* " + results);
    });
  });
};

app.use(logfmt.requestLogger());

app.post('/ferocia', function(req, res) {
  Promise.all([
    getTimes(1234, 1),
    getTimes(1396, 12),
    getTimes(3020, 6)
  ]).then(function(results) {
    res.send({
      text: ["Did somebody mention *trams*?"].concat(results).join("\n")
    });
  });
});

app.get('/stop/:id', function(req, res) {
  return getTimes(parseInt(req.params.id) || 1234, function(results) {
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
