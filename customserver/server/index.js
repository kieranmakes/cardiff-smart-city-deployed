const express = require("express");
const app = express();
const path = require("path");

let csvFilePath = path.resolve("./server/tmp/latestAirQuality.csv");
let jsonFilePath = path.resolve("./server/tmp/dataJSON.json");
let jsonLatestAirQualityFilePath = path.resolve(
  "./server/tmp/latestAirQuality.json"
);

const airQuality = require("./lib/airQuality.js");
airQuality(3600000, csvFilePath, jsonFilePath, jsonLatestAirQualityFilePath);

app.get("/", function (req, res) {
  try {
    res.json(require(jsonLatestAirQualityFilePath));
  } catch (e) {
    console.log(e);
  }
});

app.listen(process.env.PORT, process.env.HOST, (err) => {
  if (!err) {
    console.log("App Listening on port: " + process.env.PORT);
  } else {
    throw err;
  }
});
