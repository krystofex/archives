const puppeteer = require("puppeteer");
var fs = require("fs");

var stream = fs.createWriteStream("data/data.csv", { flags: "a" });

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
  });
  const page = await browser.newPage();

  await page.goto("https://www.pardubice.eu/biketower/", {
    waitUntil: "networkidle2",
  });

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
    return `\n${datetime},${firstLine[1].replaceAll(
      " ",
      ""
    )},${secondLine[1].replaceAll(" ", "")}`;
  });
  await browser.close();
  stream.write(content);
  stream.end();
})();