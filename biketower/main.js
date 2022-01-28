const puppeteer = require("puppeteer");
var fs = require("fs");

const dataLocation = "../data/biketower/data.csv";

var stream = fs.createWriteStream(dataLocation, { flags: "a" }); // create a writable stream

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
  }); // launch browser 
  const page = await browser.newPage(); // create new page

  await page.goto("https://www.pardubice.eu/biketower/", {
    waitUntil: "networkidle2",
  }); // go to page

  content = await page.evaluate(() => {
    const firstLine = document
      .querySelector(
        "body > div.main > div > div.row > div > div > div > div > ul > li:nth-child(1)"
      )
      .innerText.split(":");  
    const secondLine = document
      .querySelector(
        "body > div.main > div > div.row > div > div > div > div > ul > li:nth-child(2)"
      )
      .innerText.split(":");
    let datetime = document
      .querySelector(
        "body > div.main > div > div.row > div > div > div > div > ul > li:nth-child(3)"
      )
      .innerText.split(":");
    datetime = datetime[1].substring(1) + ":" + datetime[2];
    return `${datetime},${firstLine[1].replaceAll(
      " ",
      ""
    )},${secondLine[1].replaceAll(" ", "")}\n`;
  });
  await browser.close();
  stream.write(content);
  stream.end();
})();
