const puppeteer = require("puppeteer");
var fs = require("fs");

const dataLocation = "../data/chrudimka/data.csv";

var stream = fs.createWriteStream(dataLocation, { flags: "a" }); // create a writable stream
const data = fs.readFileSync(dataLocation, "utf8"); // read file
const lastRecord = data.split("\n").reverse()[0].split(",")[0]; // get timestamp of last record

// main function
(async () => {
  const browser = await puppeteer.launch({
    headless: true,
  }); // launch browser
  const page = await browser.newPage();

  // wait until the page is loaded
  await page.goto(
    "https://hydro.chmi.cz/hpps/popup_hpps_prfdyn.php?seq=307210",
    {
      waitUntil: "networkidle2",
    }
  ); // go to page

  content = await page.evaluate(
    (lastRecord) => {
      const datetime = document.querySelector(
        "#page > div.box > div > table.stdstationtbl > tbody > tr:nth-child(3) > td > div > table > tbody > tr:nth-child(11) > td:nth-child(1)"
      ).innerText; // get date and time of record from table

      const status = document.querySelector(
        "#page > div.box > div > table.stdstationtbl > tbody > tr:nth-child(3) > td > div > table > tbody > tr:nth-child(11) > td:nth-child(2)"
      ).innerText; // get status from table

      let flow = document.querySelector(
        "#page > div.box > div > table.stdstationtbl > tbody > tr:nth-child(3) > td > div > table > tbody > tr:nth-child(11) > td:nth-child(3)"
      ).innerText; // get flow from table

      const temperature = document.querySelector(
        "#page > div.box > div > table.stdstationtbl > tbody > tr:nth-child(3) > td > div > table > tbody > tr:nth-child(11) > td:nth-child(4)"
      ).innerText; // get tempererature from table

      // check if temperature is filled in
      if (temperature != "" && lastRecord != datetime) {
        // if temperature is filled in and timestamp is not the same as in last record
        return `${datetime},${status},${flow},${temperature}\n`; // format data for csv
      } else {
        // if temperature is not temperature in the record or there is no new data, return null
        return null;
      }
    },
    [lastRecord]
  );
  await browser.close(); // close browser

  if (content == null) {
    // if there is no new data
    console.log("no new data🐿️");
  } else {
    // if there is new data write them to file
    stream.write(content);
  }
  stream.end(); // close file
})();
