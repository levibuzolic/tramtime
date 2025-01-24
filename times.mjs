import { v4 } from "uuid";

const dateTimeFormat = new Intl.DateTimeFormat("en-AU");

/**
 * @param {string | number} stop
 * @param {string | number} route
 * @returns {string}
 */
const getUrl = (stop, route = 0) => {
	const url = new URL(
		`http://ws3.tramtracker.com.au/TramTracker/restservice/GetNextPredictedRoutesCollection/${stop}/${route}/false/`,
	);
	url.searchParams.append("aid", "TTIOSJSON");
	url.searchParams.append("cid", "2");
	url.searchParams.append("tkn", v4());
	return url.toString();
};

/**
 * @param {string} string
 * @returns {string}
 */
const parseDate = (string) => {
	const matches = string.match(/\/Date\((\d+)\+\d+\)\//);
	return new Date(Number(matches[1]));
};

const getTimes = async (stop, route, title, footer) => {
	try {
		const url = getUrl(stop, route);
		console.log({url});

		const response = await fetch(url, { ContentType: "application/json" });
    /** @type TimeResponse */
    const data = await response.json();

    console.log(JSON.stringify(data, null, 2));

		const timeResponded = parseDate(data.timeResponded);
		const results = (data.responseObject || [])
			.map((time) => {
				const arrivalTime = parseDate(time.PredictedArrivalDateTime);
				const number = time.RouteNo;
				const minutes = (arrivalTime - timeResponded) / 1000 / 60;
				const string = dateTimeFormat.formatRange(arrivalTime, timeResponded);
				return { number, minutes, string };
			})
			.map((routeTime) => routeTime.string)
			.join(", ");

		return {
			fallback: `${title}: ${results}`,
			color: "#bcd531",
			title,
			text: results,
			footer,
		};
	} catch (error) {
		console.error({error});
		throw error;
	}
};

/**
 * @type {{name: string, stop: number}[]}
 */
const STOPS = [
  {name: 'Collins St & Elizabeth St - Westbound', stop: 3505},
  {name: 'Collins St & Elizabeth St - Eastbound', stop: 3405},
  {name: 'Collins St & Swanston St - Westbound', stop: 3506},
  {name: 'Collins St & Swanston St - Eastbound', stop: 3406},
  {name: 'Elizabeth St & Little Collins St - Northbound', stop: 3802},
  {name: 'Swanston St & Flinders Ln - Southbound', stop: 3011},
]


export default async (req, res) => {
	res.setHeader("content-type", "application/json");
	try {
    const attachments = await Promise.all(
      STOPS.map(({name, stop}) => getTimes(stop, 0, name))
    );
		res.end(JSON.stringify({ attachments }));
	} catch (error) {
		console.error(error);
		res.statusCode = 500;
		res.end(JSON.stringify({ error: "Internal Server Error" }));
	}
};

/**
 * @typedef {Object} RouteTime
 * @property {'NextPredictedRoutesCollectionInfo'} __type
 * @property {boolean} AirConditioned
 * @property {string} Destination
 * @property {boolean} DisplayAC
 * @property {DisruptionMessage} DisruptionMessage
 * @property {boolean} HasDisruption
 * @property {boolean} HasSpecialEvent
 * @property {string} HeadBoardRouteNo
 * @property {number} InternalRouteNo
 * @property {boolean} IsLowFloorTram
 * @property {boolean} IsTTAvailable
 * @property {string} PredictedArrivalDateTime
 * @property {string} RouteNo
 * @property {string} SpecialEventMessage
 * @property {number} TripID
 * @property {number} VehicleNo
 *
 * @typedef {Object} DisruptionMessage
 * @property {'Text'} DisplayType
 * @property {number} MessageCount
 * @property {string[]} Messages
 *
 * @typedef {Object} TimeResponse
 * @property {string | null} errorMessage
 * @property {boolean} hasError
 * @property {boolean} hasResponse
 * @property {RouteTime[]} responseObject
 * @property {string} timeRequested
 * @property {string} timeResponded
 * @property {string} webMethodCalled
 */

/*

{
  "errorMessage": null,
  "hasError": false,
  "hasResponse": true,
  "responseObject": [
    {
      "__type": "NextPredictedRoutesCollectionInfo",
      "AirConditioned": true,
      "Destination": "Sth Melb Beach",
      "DisplayAC": true,
      "DisruptionMessage": {
        "DisplayType": "Text",
        "MessageCount": 0,
        "Messages": []
      },
      "HasDisruption": false,
      "HasSpecialEvent": true,
      "HeadBoardRouteNo": "1",
      "InternalRouteNo": 1,
      "IsLowFloorTram": false,
      "IsTTAvailable": true,
      "PredictedArrivalDateTime": "/Date(1737699708000+1100)/",
      "RouteNo": "1",
      "SpecialEventMessage": "Extreme weather forecast Monday. for tips on travelling on trams during summer visit yarrarams.com.au/extreme-weather",
      "TripID": 0,
      "VehicleNo": 2080
    },
    {
      "__type": "NextPredictedRoutesCollectionInfo",
      "AirConditioned": false,
      "Destination": "Sth Melb Beach",
      "DisplayAC": false,
      "DisruptionMessage": {
        "DisplayType": "Text",
        "MessageCount": 0,
        "Messages": []
      },
      "HasDisruption": false,
      "HasSpecialEvent": true,
      "HeadBoardRouteNo": "1",
      "InternalRouteNo": 1,
      "IsLowFloorTram": false,
      "IsTTAvailable": true,
      "PredictedArrivalDateTime": "/Date(1737699960000+1100)/",
      "RouteNo": "1",
      "SpecialEventMessage": "Extreme weather forecast Monday. for tips on travelling on trams during summer visit yarrarams.com.au/extreme-weather",
      "TripID": 0,
      "VehicleNo": 189
    },
    {
      "__type": "NextPredictedRoutesCollectionInfo",
      "AirConditioned": true,
      "Destination": "Sth Melb Beach",
      "DisplayAC": true,
      "DisruptionMessage": {
        "DisplayType": "Text",
        "MessageCount": 0,
        "Messages": []
      },
      "HasDisruption": false,
      "HasSpecialEvent": true,
      "HeadBoardRouteNo": "1",
      "InternalRouteNo": 1,
      "IsLowFloorTram": false,
      "IsTTAvailable": true,
      "PredictedArrivalDateTime": "/Date(1737700524000+1100)/",
      "RouteNo": "1",
      "SpecialEventMessage": "Extreme weather forecast Monday. for tips on travelling on trams during summer visit yarrarams.com.au/extreme-weather",
      "TripID": 0,
      "VehicleNo": 2104
    },
    {
      "__type": "NextPredictedRoutesCollectionInfo",
      "AirConditioned": false,
      "Destination": "East Malvern",
      "DisplayAC": false,
      "DisruptionMessage": {
        "DisplayType": "Text",
        "MessageCount": 0,
        "Messages": []
      },
      "HasDisruption": false,
      "HasSpecialEvent": true,
      "HeadBoardRouteNo": "3",
      "InternalRouteNo": 3,
      "IsLowFloorTram": false,
      "IsTTAvailable": true,
      "PredictedArrivalDateTime": "/Date(1737700308000+1100)/",
      "RouteNo": "3",
      "SpecialEventMessage": "Extreme weather forecast Monday. for tips on travelling on trams during summer visit yarrarams.com.au/extreme-weather",
      "TripID": 0,
      "VehicleNo": 225
    },
    {
      "__type": "NextPredictedRoutesCollectionInfo",
      "AirConditioned": false,
      "Destination": "East Malvern",
      "DisplayAC": false,
      "DisruptionMessage": {
        "DisplayType": "Text",
        "MessageCount": 0,
        "Messages": []
      },
      "HasDisruption": false,
      "HasSpecialEvent": true,
      "HeadBoardRouteNo": "3",
      "InternalRouteNo": 3,
      "IsLowFloorTram": false,
      "IsTTAvailable": true,
      "PredictedArrivalDateTime": "/Date(1737700500000+1100)/",
      "RouteNo": "3",
      "SpecialEventMessage": "Extreme weather forecast Monday. for tips on travelling on trams during summer visit yarrarams.com.au/extreme-weather",
      "TripID": 0,
      "VehicleNo": 183
    },
    {
      "__type": "NextPredictedRoutesCollectionInfo",
      "AirConditioned": false,
      "Destination": "East Malvern",
      "DisplayAC": false,
      "DisruptionMessage": {
        "DisplayType": "Text",
        "MessageCount": 0,
        "Messages": []
      },
      "HasDisruption": false,
      "HasSpecialEvent": true,
      "HeadBoardRouteNo": "3",
      "InternalRouteNo": 3,
      "IsLowFloorTram": false,
      "IsTTAvailable": true,
      "PredictedArrivalDateTime": "/Date(1737701040000+1100)/",
      "RouteNo": "3",
      "SpecialEventMessage": "Extreme weather forecast Monday. for tips on travelling on trams during summer visit yarrarams.com.au/extreme-weather",
      "TripID": 0,
      "VehicleNo": 214
    },
    {
      "__type": "NextPredictedRoutesCollectionInfo",
      "AirConditioned": true,
      "Destination": "Malvern",
      "DisplayAC": true,
      "DisruptionMessage": {
        "DisplayType": "Text",
        "MessageCount": 0,
        "Messages": []
      },
      "HasDisruption": false,
      "HasSpecialEvent": true,
      "HeadBoardRouteNo": "5",
      "InternalRouteNo": 5,
      "IsLowFloorTram": true,
      "IsTTAvailable": true,
      "PredictedArrivalDateTime": "/Date(1737699762000+1100)/",
      "RouteNo": "5",
      "SpecialEventMessage": "Extreme weather forecast Monday. for tips on travelling on trams during summer visit yarrarams.com.au/extreme-weather",
      "TripID": 0,
      "VehicleNo": 3501
    },
    {
      "__type": "NextPredictedRoutesCollectionInfo",
      "AirConditioned": true,
      "Destination": "Malvern",
      "DisplayAC": true,
      "DisruptionMessage": {
        "DisplayType": "Text",
        "MessageCount": 0,
        "Messages": []
      },
      "HasDisruption": false,
      "HasSpecialEvent": true,
      "HeadBoardRouteNo": "5",
      "InternalRouteNo": 5,
      "IsLowFloorTram": true,
      "IsTTAvailable": true,
      "PredictedArrivalDateTime": "/Date(1737700320000+1100)/",
      "RouteNo": "5",
      "SpecialEventMessage": "Extreme weather forecast Monday. for tips on travelling on trams during summer visit yarrarams.com.au/extreme-weather",
      "TripID": 0,
      "VehicleNo": 3537
    },
    {
      "__type": "NextPredictedRoutesCollectionInfo",
      "AirConditioned": true,
      "Destination": "Malvern",
      "DisplayAC": true,
      "DisruptionMessage": {
        "DisplayType": "Text",
        "MessageCount": 0,
        "Messages": []
      },
      "HasDisruption": false,
      "HasSpecialEvent": true,
      "HeadBoardRouteNo": "5",
      "InternalRouteNo": 5,
      "IsLowFloorTram": true,
      "IsTTAvailable": true,
      "PredictedArrivalDateTime": "/Date(1737700860000+1100)/",
      "RouteNo": "5",
      "SpecialEventMessage": "Extreme weather forecast Monday. for tips on travelling on trams during summer visit yarrarams.com.au/extreme-weather",
      "TripID": 0,
      "VehicleNo": 3534
    },
    {
      "__type": "NextPredictedRoutesCollectionInfo",
      "AirConditioned": true,
      "Destination": "Glen Iris",
      "DisplayAC": true,
      "DisruptionMessage": {
        "DisplayType": "Text",
        "MessageCount": 0,
        "Messages": []
      },
      "HasDisruption": false,
      "HasSpecialEvent": true,
      "HeadBoardRouteNo": "6",
      "InternalRouteNo": 6,
      "IsLowFloorTram": false,
      "IsTTAvailable": true,
      "PredictedArrivalDateTime": "/Date(1737699900000+1100)/",
      "RouteNo": "6",
      "SpecialEventMessage": "Extreme weather forecast Monday. for tips on travelling on trams during summer visit yarrarams.com.au/extreme-weather",
      "TripID": 0,
      "VehicleNo": 2128
    },
    {
      "__type": "NextPredictedRoutesCollectionInfo",
      "AirConditioned": false,
      "Destination": "Glen Iris",
      "DisplayAC": false,
      "DisruptionMessage": {
        "DisplayType": "Text",
        "MessageCount": 0,
        "Messages": []
      },
      "HasDisruption": false,
      "HasSpecialEvent": true,
      "HeadBoardRouteNo": "6",
      "InternalRouteNo": 6,
      "IsLowFloorTram": false,
      "IsTTAvailable": true,
      "PredictedArrivalDateTime": "/Date(1737700494000+1100)/",
      "RouteNo": "6",
      "SpecialEventMessage": "Extreme weather forecast Monday. for tips on travelling on trams during summer visit yarrarams.com.au/extreme-weather",
      "TripID": 0,
      "VehicleNo": 174
    },
    {
      "__type": "NextPredictedRoutesCollectionInfo",
      "AirConditioned": false,
      "Destination": "Glen Iris",
      "DisplayAC": false,
      "DisruptionMessage": {
        "DisplayType": "Text",
        "MessageCount": 0,
        "Messages": []
      },
      "HasDisruption": false,
      "HasSpecialEvent": true,
      "HeadBoardRouteNo": "6",
      "InternalRouteNo": 6,
      "IsLowFloorTram": false,
      "IsTTAvailable": true,
      "PredictedArrivalDateTime": "/Date(1737700968000+1100)/",
      "RouteNo": "6",
      "SpecialEventMessage": "Extreme weather forecast Monday. for tips on travelling on trams during summer visit yarrarams.com.au/extreme-weather",
      "TripID": 0,
      "VehicleNo": 224
    },
    {
      "__type": "NextPredictedRoutesCollectionInfo",
      "AirConditioned": true,
      "Destination": "Kew via St Kilda",
      "DisplayAC": true,
      "DisruptionMessage": {
        "DisplayType": "Text",
        "MessageCount": 0,
        "Messages": []
      },
      "HasDisruption": false,
      "HasSpecialEvent": true,
      "HeadBoardRouteNo": "16",
      "InternalRouteNo": 16,
      "IsLowFloorTram": true,
      "IsTTAvailable": true,
      "PredictedArrivalDateTime": "/Date(1737699990000+1100)/",
      "RouteNo": "16",
      "SpecialEventMessage": "Extreme weather forecast Monday. for tips on travelling on trams during summer visit yarrarams.com.au/extreme-weather",
      "TripID": 0,
      "VehicleNo": 3523
    },
    {
      "__type": "NextPredictedRoutesCollectionInfo",
      "AirConditioned": false,
      "Destination": "Malvern Depot",
      "DisplayAC": false,
      "DisruptionMessage": {
        "DisplayType": "Text",
        "MessageCount": 0,
        "Messages": []
      },
      "HasDisruption": false,
      "HasSpecialEvent": true,
      "HeadBoardRouteNo": "16d",
      "InternalRouteNo": 14,
      "IsLowFloorTram": false,
      "IsTTAvailable": true,
      "PredictedArrivalDateTime": "/Date(1737700158000+1100)/",
      "RouteNo": "16",
      "SpecialEventMessage": "Extreme weather forecast Monday. for tips on travelling on trams during summer visit yarrarams.com.au/extreme-weather",
      "TripID": 0,
      "VehicleNo": 193
    },
    {
      "__type": "NextPredictedRoutesCollectionInfo",
      "AirConditioned": false,
      "Destination": "Kew via St Kilda",
      "DisplayAC": false,
      "DisruptionMessage": {
        "DisplayType": "Text",
        "MessageCount": 0,
        "Messages": []
      },
      "HasDisruption": false,
      "HasSpecialEvent": true,
      "HeadBoardRouteNo": "16",
      "InternalRouteNo": 16,
      "IsLowFloorTram": false,
      "IsTTAvailable": true,
      "PredictedArrivalDateTime": "/Date(1737700740000+1100)/",
      "RouteNo": "16",
      "SpecialEventMessage": "Extreme weather forecast Monday. for tips on travelling on trams during summer visit yarrarams.com.au/extreme-weather",
      "TripID": 0,
      "VehicleNo": 229
    },
    {
      "__type": "NextPredictedRoutesCollectionInfo",
      "AirConditioned": true,
      "Destination": "East Brighton",
      "DisplayAC": true,
      "DisruptionMessage": {
        "DisplayType": "Text",
        "MessageCount": 0,
        "Messages": []
      },
      "HasDisruption": false,
      "HasSpecialEvent": true,
      "HeadBoardRouteNo": "64",
      "InternalRouteNo": 64,
      "IsLowFloorTram": false,
      "IsTTAvailable": true,
      "PredictedArrivalDateTime": "/Date(1737700002000+1100)/",
      "RouteNo": "64",
      "SpecialEventMessage": "Extreme weather forecast Monday. for tips on travelling on trams during summer visit yarrarams.com.au/extreme-weather",
      "TripID": 0,
      "VehicleNo": 2023
    },
    {
      "__type": "NextPredictedRoutesCollectionInfo",
      "AirConditioned": true,
      "Destination": "East Brighton",
      "DisplayAC": true,
      "DisruptionMessage": {
        "DisplayType": "Text",
        "MessageCount": 0,
        "Messages": []
      },
      "HasDisruption": false,
      "HasSpecialEvent": true,
      "HeadBoardRouteNo": "64",
      "InternalRouteNo": 64,
      "IsLowFloorTram": false,
      "IsTTAvailable": true,
      "PredictedArrivalDateTime": "/Date(1737700620000+1100)/",
      "RouteNo": "64",
      "SpecialEventMessage": "Extreme weather forecast Monday. for tips on travelling on trams during summer visit yarrarams.com.au/extreme-weather",
      "TripID": 0,
      "VehicleNo": 2055
    },
    {
      "__type": "NextPredictedRoutesCollectionInfo",
      "AirConditioned": true,
      "Destination": "East Brighton",
      "DisplayAC": true,
      "DisruptionMessage": {
        "DisplayType": "Text",
        "MessageCount": 0,
        "Messages": []
      },
      "HasDisruption": false,
      "HasSpecialEvent": true,
      "HeadBoardRouteNo": "64",
      "InternalRouteNo": 64,
      "IsLowFloorTram": false,
      "IsTTAvailable": true,
      "PredictedArrivalDateTime": "/Date(1737701100000+1100)/",
      "RouteNo": "64",
      "SpecialEventMessage": "Extreme weather forecast Monday. for tips on travelling on trams during summer visit yarrarams.com.au/extreme-weather",
      "TripID": 0,
      "VehicleNo": 2017
    },
    {
      "__type": "NextPredictedRoutesCollectionInfo",
      "AirConditioned": true,
      "Destination": "Carnegie",
      "DisplayAC": true,
      "DisruptionMessage": {
        "DisplayType": "Text",
        "MessageCount": 0,
        "Messages": []
      },
      "HasDisruption": false,
      "HasSpecialEvent": true,
      "HeadBoardRouteNo": "67",
      "InternalRouteNo": 67,
      "IsLowFloorTram": false,
      "IsTTAvailable": true,
      "PredictedArrivalDateTime": "/Date(1737699888000+1100)/",
      "RouteNo": "67",
      "SpecialEventMessage": "Extreme weather forecast Monday. for tips on travelling on trams during summer visit yarrarams.com.au/extreme-weather",
      "TripID": 0,
      "VehicleNo": 2063
    },
    {
      "__type": "NextPredictedRoutesCollectionInfo",
      "AirConditioned": true,
      "Destination": "Carnegie",
      "DisplayAC": true,
      "DisruptionMessage": {
        "DisplayType": "Text",
        "MessageCount": 0,
        "Messages": []
      },
      "HasDisruption": false,
      "HasSpecialEvent": true,
      "HeadBoardRouteNo": "67",
      "InternalRouteNo": 67,
      "IsLowFloorTram": false,
      "IsTTAvailable": true,
      "PredictedArrivalDateTime": "/Date(1737700560000+1100)/",
      "RouteNo": "67",
      "SpecialEventMessage": "Extreme weather forecast Monday. for tips on travelling on trams during summer visit yarrarams.com.au/extreme-weather",
      "TripID": 0,
      "VehicleNo": 2092
    },
    {
      "__type": "NextPredictedRoutesCollectionInfo",
      "AirConditioned": true,
      "Destination": "Carnegie",
      "DisplayAC": true,
      "DisruptionMessage": {
        "DisplayType": "Text",
        "MessageCount": 0,
        "Messages": []
      },
      "HasDisruption": false,
      "HasSpecialEvent": true,
      "HeadBoardRouteNo": "67",
      "InternalRouteNo": 67,
      "IsLowFloorTram": false,
      "IsTTAvailable": true,
      "PredictedArrivalDateTime": "/Date(1737701220000+1100)/",
      "RouteNo": "67",
      "SpecialEventMessage": "Extreme weather forecast Monday. for tips on travelling on trams during summer visit yarrarams.com.au/extreme-weather",
      "TripID": 0,
      "VehicleNo": 2029
    },
    {
      "__type": "NextPredictedRoutesCollectionInfo",
      "AirConditioned": false,
      "Destination": "Camberwell",
      "DisplayAC": false,
      "DisruptionMessage": {
        "DisplayType": "Text",
        "MessageCount": 0,
        "Messages": []
      },
      "HasDisruption": false,
      "HasSpecialEvent": true,
      "HeadBoardRouteNo": "72",
      "InternalRouteNo": 72,
      "IsLowFloorTram": false,
      "IsTTAvailable": true,
      "PredictedArrivalDateTime": "/Date(1737699639039+1100)/",
      "RouteNo": "72",
      "SpecialEventMessage": "Extreme weather forecast Monday. for tips on travelling on trams during summer visit yarrarams.com.au/extreme-weather",
      "TripID": 0,
      "VehicleNo": 162
    },
    {
      "__type": "NextPredictedRoutesCollectionInfo",
      "AirConditioned": true,
      "Destination": "Camberwell",
      "DisplayAC": true,
      "DisruptionMessage": {
        "DisplayType": "Text",
        "MessageCount": 0,
        "Messages": []
      },
      "HasDisruption": false,
      "HasSpecialEvent": true,
      "HeadBoardRouteNo": "72",
      "InternalRouteNo": 72,
      "IsLowFloorTram": true,
      "IsTTAvailable": true,
      "PredictedArrivalDateTime": "/Date(1737700410000+1100)/",
      "RouteNo": "72",
      "SpecialEventMessage": "Extreme weather forecast Monday. for tips on travelling on trams during summer visit yarrarams.com.au/extreme-weather",
      "TripID": 0,
      "VehicleNo": 3510
    },
    {
      "__type": "NextPredictedRoutesCollectionInfo",
      "AirConditioned": false,
      "Destination": "Camberwell",
      "DisplayAC": false,
      "DisruptionMessage": {
        "DisplayType": "Text",
        "MessageCount": 0,
        "Messages": []
      },
      "HasDisruption": false,
      "HasSpecialEvent": true,
      "HeadBoardRouteNo": "72",
      "InternalRouteNo": 72,
      "IsLowFloorTram": false,
      "IsTTAvailable": true,
      "PredictedArrivalDateTime": "/Date(1737700800000+1100)/",
      "RouteNo": "72",
      "SpecialEventMessage": "Extreme weather forecast Monday. for tips on travelling on trams during summer visit yarrarams.com.au/extreme-weather",
      "TripID": 0,
      "VehicleNo": 180
    }
  ],
  "timeRequested": "/Date(1737699628945+1100)/",
  "timeResponded": "/Date(1737699629070+1100)/",
  "webMethodCalled": "GetNextPredictedRoutesCollection"
}

*/
