const express = require("express");
const app = express();
const path = require("path");
const fs = require("fs");

let csvFilePath = path.resolve("./server/tmp/latestAirQuality.csv");
let jsonFilePath = path.resolve("./server/tmp/dataJSON.json");
let jsonLatestAirQualityFilePath = path.resolve(
  "./server/tmp/latestAirQuality.json"
);

const airQuality = require("./lib/airQuality.js");
airQuality(3600000, csvFilePath, jsonFilePath, jsonLatestAirQualityFilePath);

app.get("/", function (req, res) {
  try {
	console.log("request made")
	let file_raw = fs.readFileSync(jsonLatestAirQualityFilePath, 'utf8')	
	let dataString = file_raw.toString()
	let data = JSON.parse(dataString)
	
    res.json(data);
  } catch (e) {
    console.log(e);
  }
});


app.listen(process.env.PORT, process.env.HOST, (err) => {
  if (!err) {
    console.log("App Listening on port: " + process.env.PORT);
  } else {
    console.log(err)
  }
});
