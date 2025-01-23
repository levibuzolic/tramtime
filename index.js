const request = require("request");
const moment = require("moment");

const randomNumber = () => Math.floor(Math.random() * 9.99);

const randomToken = () =>
	`F57${randomNumber()}${randomNumber()}61F-8AA4-4626-969A-B48A0659B2DF`;

const getUrl = (stop, route = 0) =>
	`http://ws3.tramtracker.com.au/TramTracker/restservice/GetNextPredictedRoutesCollection/${stop}/${route}/false/?aid=TTIOSJSON&cid=2&tkn=${randomToken()}`;

const parseDateString = (string) => {
	const matches = string.match(/\/Date\((\d+)\+\d+\)\//);
	return moment(Number(matches[1]));
};

const getTimes = async (stop, route, title, footer) => {
	try {
		const url = getUrl(stop, route);
		console.log(url);
		const apiBody = await new Promise((resolve, reject) => {
			request(url, (apiError, apiResponse, apiBody) => {
				if (apiError) return reject(apiError);
				resolve(apiBody);
			});
		});

		const json = JSON.parse(apiBody);
		const timeResponded = parseDateString(json.timeResponded);
		const times = json.responseObject || [];
		const results = times
			.map((time) => {
				const arrivalTime = parseDateString(time.PredictedArrivalDateTime);
				const number = time.RouteNo;
				const minutes = (arrivalTime - timeResponded) / 1000 / 60;
				const string = arrivalTime.from(timeResponded, true);
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
		console.error(error);
		throw error;
	}
};

module.exports = async (req, res) => {
	res.setHeader("content-type", "application/json");
	try {
		const attachments = await Promise.all([
			getTimes(
				1395,
				12,
				"Route 12",
				"Stop 128 - To City - Corner of Dorcas & Clarendon",
			),
			getTimes(
				1532,
				96,
				"Route 96",
				"Stop 127 - To City - South Melbourne Market",
			),
		]);
		res.end(JSON.stringify({ attachments }));
	} catch (error) {
		console.error(error);
		res.statusCode = 500;
		res.end(JSON.stringify({ error: "Internal Server Error" }));
	}
};
