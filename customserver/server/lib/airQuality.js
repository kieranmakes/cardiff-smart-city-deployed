const axios = require("axios");
const http = require("https");
const cheerio = require("cheerio");
const fs = require("fs");
const { parse } = require("csv-parse");
const puppeteer = require("puppeteer");

async function getDownloadURL() {
  // const browser = await puppeteer.launch({
  //   headless: true,
  //   executablePath: "/usr/bin/chromium-browser",
  //   args: [
  //     "--no-sandbox",
  //     "--headless",
  //     "--disable-gpu",
  //     "--disable-dev-shm-usage",
  //   ],
  // });
  // const browser = await puppeteer.launch({
  //   headless: true,
  // });

  const browser = await puppeteer.connect({
    browserWSEndpoint: "ws://browserless:3000",
  });

  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(0);

  await page.goto("https://airquality.gov.wales/maps-data/data-selector/index");
  await page.waitForSelector(
    "#acDataSelectorSequential > input.btn.btn-primary"
  );
  await page.click("#acDataSelectorSequential > input.btn.btn-primary");
  await page.waitForSelector(
    "#acDataSelectorSequential > input.btn.btn-primary"
  );
  await page.click("#acDataSelectorSequential > input.btn.btn-primary");
  await page.waitForSelector(
    "#acDataSelectorSequential > input.btn.btn-primary"
  );
  await page.click("#acDataSelectorSequential > input.btn.btn-primary");
  await page.waitForSelector(
    "#acDataSelectorSequential > input.btn.btn-primary"
  );
  await page.click("#acDataSelectorSequential > input.btn.btn-primary");
  await page.waitForSelector(
    "#acDataSelectorSequential > input.btn.btn-primary"
  );
  await page.click("#f_region_id > option:nth-child(5)");
  await page.click("#acDataSelectorSequential > input.btn.btn-primary");
  await page.waitForSelector(
    "#acDataSelectorSequential > input.btn.btn-primary"
  );
  await page.click("#acDataSelectorSequential > input.btn.btn-primary");
  await page.waitForSelector(
    "#acDataSelectorSequential > input.btn.btn-primary"
  );
  let bodyHTML = await page.content();

  const $ = cheerio.load(bodyHTML);

  let baseLink = "https://airquality.gov.wales/maps-data/data-selector/index";
  let downloadLink = $(
    "body > div > div > div > div > div:nth-child(1) > div > div > div:nth-child(2) > section > div > div.region.region-content > div > div > div.grid__item.three-quarters > div > div.data-grid-toolbar > div.data-grid-export > div:nth-child(1) > a"
  ).attr("href");
  if (downloadLink === undefined) {
    return undefined;
  }
  console.log(downloadLink);
  await browser.close();
  let link = baseLink + downloadLink;
  console.log(link);
  return link;
}

function downloadCSVAirQualityData(filePath) {
  return new Promise(async (resolve, reject) => {
    let link;
    try {
      link = await getDownloadURL();
      if (link === undefined) {
        resolve();
      }
    } catch (e) {
      reject(e);
    }
    console.log(link);

    const file = fs.createWriteStream(filePath);
    const request = http.get(link, function (response) {
      response.pipe(file);

      // after download completed close filestream
      file.on("finish", () => {
        file.close();
        console.log("Download Completed");

        fs.readFile(filePath, function (err, data) {
          // read file to memory
          if (!err) {
            data = data.toString(); // stringify buffer
            var position = data.toString().indexOf("\n"); // find position of new line element
            if (position != -1) {
              // if new line element found
              data = data.substr(position + 1); // subtract string based on first line length

              fs.writeFile(filePath, data, function (err) {
                console.log("woow");
                resolve();
                // write file
                if (err) {
                  // if error, report
                  console.log(err);
                  reject(err);
                }
              });
            } else {
              let errMsg = "no lines found";
              console.log(errMsg);
              reject(errMsg);
            }
          } else {
            console.log(err);
            reject(err);
          }
        });
      });
    });
  });
}

function csvParse(filePath, jsonWriteFilePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, (err, data) => {
      if (!err) {
        data = data.toString();
        parse(
          data,
          {
            columns: true,
          },
          function (err, records) {
            console.log(JSON.stringify(records));
            fs.writeFile(
              jsonWriteFilePath,
              JSON.stringify(records),
              (err, res) => {
                if (!err) {
                  console.log("recorded json file");
                  resolve();
                } else {
                  reject(err);
                }
              }
            );
          }
        );
      } else {
        console.log(err);
        reject(err);
      }
    });
  });
}

function getLatestValues(filePath) {
  // comment this out to let filePath come from function parameter
  // let filePath = "./dataJSON.json";
  let data = require(filePath);
  let latestData = {
    Date: "",
    Ozone: "",
    "Nitric Oxide": "",
    "Nitrogen dioxide": "",
    "Nitrogen oxides as nitrogen dioxide": "",
    "Sulphur dioxide": "",
    "Carbon Monoxide": "",
    "Particulates < 10um (hourly measured)": "",
    "Particulates < 2.5um (hourly measured)": "",
    "Modelled Wind Direction": "",
    "Modelled Wind Speed": "",
    "Modelled Temperature": "",
  };
  latestData["Date"] = data[0]["Date"];
  data = data.reverse();

  let keys = Object.keys(latestData);
  keys.shift(1);
  console.log(keys);
  for (let i = 0; i < keys.length; i++) {
    let key = keys[i];
    for (let j = 0; j < data.length; j++) {
      let object = data[j];
      if (object[key] !== "") {
        latestData[key] = object[key];
        break;
      }
    }
  }
  return latestData;
}

module.exports = function airQuality(
  timeInterval,
  csvFilePath,
  jsonFilePath,
  jsonLatestAirQualityFilePath
) {
const f = () => {
    downloadCSVAirQualityData(csvFilePath)
      .then(() => {
        csvParse(csvFilePath, jsonFilePath).then(() => {
          let latestAirQualityJSON = JSON.stringify(
            getLatestValues(jsonFilePath)
          );
          fs.writeFile(
            jsonLatestAirQualityFilePath,
            latestAirQualityJSON,
            (err, res) => {
              if (!err) {
                console.log("latest air quality data file written");
              } else {
                console.log(err);
              }
            }
          );
        });
      })
      .catch((e) => {
        console.log("In the reject");
        console.log(e);
      });
}
	f();
  setInterval(f, timeInterval);
};
