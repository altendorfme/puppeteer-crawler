const puppeteer = require("puppeteer");

module.exports = function (url) {
  return new Promise((resolve, reject) => {
    (async () => {
      const browser = await puppeteer.launch({
        // headless: true, // debug only
        args: ["--no-sandbox"],
      });

      const page = await browser.newPage();
      await page.goto(url, {
        waitUntil: "networkidle0",
      });

      const data = await page.evaluate(
        () => document.querySelector("body").innerHTML
      );

      await browser.close();

      resolve(data);
    })();
  });
};
