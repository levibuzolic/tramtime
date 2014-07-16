var express = require('express');
var request = require('request');
var logfmt = require('logfmt');
var app = express();
var port = Number(process.env.PORT || 4000);

var server = app.listen(port, function() {
  console.log('Listening on port ' + port);
});

app.use(logfmt.requestLogger());

app.get('/', function(req, res) {
  res.send('it works!');
});

app.get('/stop', function(req, res) {
  request('http://www.tramtracker.com.au/Controllers/GetNextPredictionsForStop.ashx?stopNo=1234&routeNo=0&isLowFloor=false', function(apiError, apiResponse, apiBody) {
    res.send(JSON.parse(apiBody));
  });
});

app.use(function(err, req, res, next){
  console.error(err.stack);
  res.send(500, 'Error 500');
});

// The next tram on route 1 to the city is due in X minutes. The next tram on route 112 to the city is due in X minutes.
