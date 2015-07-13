var app, express, getTimesForStop, getUrlForStop, logfmt, moment, parseDateString, port, request, server;

express = require('express');
request = require('request');
moment = require('moment');
logfmt = require('logfmt');

app = express();

port = Number(process.env.PORT || 4000);

server = app.listen(port, function() {
  return console.log('Listening on port ' + port);
});

/*

iOS API
-------
http://ws3.tramtracker.com.au/TramTracker/restservice/GetNextPredictedRoutesCollection/1234/0/false/?aid=TTIOSJSON&cid=2&tkn=F570461F-8AA4-4626-969A-B48A0659B2DF

Web API (Broken)
----------------
http://www.tramtracker.com.au/Controllers/GetNextPredictionsForStop.ashx?stopNo=1234&routeNo=0&isLowFloor=false

Web API 2
---------
POST: StopID=1234&Route=&LowFloorOnly=false
http://yarratrams.com.au/base/tramTrackerController/TramInfoAjaxRequest

*/

var getRandomNumber = function() {
  return Math.floor(Math.random() * 10);
};

var getRandomToken = function() {
  // return 'F570461F-8AA4-4626-969A-B48A0659B2DF';
  return ['F57', getRandomNumber(), getRandomNumber(), '61F-8AA4-4626-969A-B48A0659B2DF'].join();
};

getUrlForStop = function(stop) {
  return "http://ws3.tramtracker.com.au/TramTracker/restservice/GetNextPredictedRoutesCollection/" + stop + "/0/false/?aid=TTIOSJSON&cid=2&tkn=" + getRandomToken();
  // return "http://www.tramtracker.com.au/Controllers/GetNextPredictionsForStop.ashx?stopNo=" + stop + "&routeNo=0&isLowFloor=false";
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
  return getTimesForStop(parseInt(req.params.id), function(results) {
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
