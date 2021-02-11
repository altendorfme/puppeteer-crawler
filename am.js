const puppeteer = require("puppeteer");

module.exports = function (url) {
  return new Promise((resolve, reject) => {
    (async () => {
      const browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox"],
      });

      const page = await browser.newPage();

      await page.setViewport({width: 1366, height: 768});

      await page.goto(url, {
        waitUntil: ['load', 'domcontentloaded','networkidle0','networkidle2'],
      });

      await page.mouse.move(640, 340);

      await page.waitForTimeout(2000);

      const data = await page.evaluate(
        () => document.querySelector("html").outerHTML
      );
      
      await browser.close();

      resolve(data);
    })();
  });
};
