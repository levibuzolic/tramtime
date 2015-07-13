var app, express, getTimesForStop, getUrlForStop, logfmt, moment, newrelic, parseDateString, port, request, server;

newrelic = require('newrelic');
express = require('express');
request = require('request');
moment = require('moment');
logfmt = require('logfmt');

app = express();

port = Number(process.env.PORT || 4000);

server = app.listen(port, function() {
  return console.log('Listening on port ' + port);
});

getUrlForStop = function(stop) {
  return "http://www.tramtracker.com.au/Controllers/GetNextPredictionsForStop.ashx?stopNo=" + stop + "&routeNo=0&isLowFloor=false";
};

parseDateString = function(string) {
  var matches;
  matches = string.match(/\/Date\((\d+)\+\d+\)\//);
  return moment(Number(matches[1]));
};

getTimesForStop = function(stop, callback) {
  if (stop == null) {
    stop = 1234;
  }
  return request(getUrlForStop(stop), function(apiError, apiResponse, apiBody) {
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
    })();
    return typeof callback === "function" ? callback(results) : void 0;
  });
};

app.use(logfmt.requestLogger());

app.post('/ferocia', function(req, res) {
  return getTimesForStop(1234, function(route1) {
    return getTimesForStop(1396, function(route12) {
      var response, route12times, route1times;
      route1times = route1.map(function(time) {
        return time.string;
      }).join(', ');
      route12times = route12.map(function(time) {
        return time.string;
      }).join(', ');
      response = {
        text: "Did somebody mention *trams*?\n*Route 1:* " + route1times + "\n*Route 12:* " + route12times
      };
      return res.send(response);
    });
  });
});

app.get('/stop/:id', function(req, res) {
  return getTimesForStop(req.params.id, function(results) {
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
