const puppeteer = require("puppeteer");

module.exports = function (url) {
  return new Promise((resolve, reject) => {
    (async () => {
      const browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox"],
      });

      const page = await browser.newPage();
      const numberPattern = /\d+/g;
      
      await page.setViewport({width: 1366, height: 768});

      await page.goto(url, {
        waitUntil: ['load', 'domcontentloaded','networkidle0','networkidle2'],
      });

      const doses = [];

      await page.mouse.move(560, 315);
      await page.waitForXPath('//body//div[contains(@class, "tab-tooltip")]');
      const data1 = await page.evaluate(
        () => document.querySelectorAll('.tab-ubertipTooltip span')[0].innerText
      );
      var split_string1 = data1.split(":");
      doses.push(split_string1[1].match(numberPattern).join(''));
  
      await page.mouse.move(560, 380);
      await page.waitForXPath('//body//div[contains(@class, "tab-tooltip")]');
      const data2 = await page.evaluate(
        () => document.querySelectorAll('.tab-ubertipTooltip span')[0].innerText
      );
      var split_string2 = data2.split(":");
      doses.push(split_string2[1].match(numberPattern).join(''));

      await browser.close();

      resolve(JSON.stringify(doses));
    })();
  });
};