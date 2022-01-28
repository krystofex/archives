const puppeteer = require("puppeteer");
var fs = require("fs");

var stream = fs.createWriteStream("data/data.csv", { flags: "a" });

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
  });
  const page = await browser.newPage();

  // wait until the page is loaded
  await page.goto(  
    "https://hydro.chmi.cz/hpps/popup_hpps_prfdyn.php?seq=307210",
    {
      waitUntil: "networkidle2",
    }
  );

  content = await page.evaluate(() => {
    // get date and time of record from table
    const datetime = document.querySelector(
      "#page > div.box > div > table.stdstationtbl > tbody > tr:nth-child(3) > td > div > table > tbody > tr:nth-child(11) > td:nth-child(1)"
    ).innerText;
    // get status from table
    const status = document.querySelector(
      "#page > div.box > div > table.stdstationtbl > tbody > tr:nth-child(3) > td > div > table > tbody > tr:nth-child(11) > td:nth-child(2)"
    ).innerText;
    // get flow from table
    let flow = document.querySelector(
      "#page > div.box > div > table.stdstationtbl > tbody > tr:nth-child(3) > td > div > table > tbody > tr:nth-child(11) > td:nth-child(3)"
    ).innerText;
    // get tempererature from table
    const temperature = document.querySelector(
      "#page > div.box > div > table.stdstationtbl > tbody > tr:nth-child(3) > td > div > table > tbody > tr:nth-child(11) > td:nth-child(4)"
    ).innerText;
    // check if temperature is filled in
    if (temperature != "")
      return `\n${datetime},${status},${flow},${temperature}`;
    // if temperature is not filled in return empty string
    else return "";
  });
  await browser.close();
  // add data to csv
  if(content != "") stream.write(content);
  stream.end();
})();
