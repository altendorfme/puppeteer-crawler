const puppeteer = require("puppeteer");

module.exports = function (state) {
  return new Promise((resolve, reject) => {
    (async () => {
      const browser = await puppeteer.launch({
        //headless: true, // debug only
        args: ["--no-sandbox"],
      });
      const page = await browser.newPage();

      await page.setViewport({width: 1366, height: 768});
      
      await page.goto("https://viz.saude.gov.br/extensions/DEMAS_C19Vacina/DEMAS_C19Vacina.html", {
        waitUntil: ['load', 'domcontentloaded','networkidle0'],
      });

      await page.waitForSelector('.paper-header .filter-drawer-toggle:nth-child(4) > #icon');
      await page.click('.paper-header .filter-drawer-toggle:nth-child(4) > #icon');
	  
	  await page.waitForSelector(".filter-container [x-dir-text='UF']");
	  await page.click(".filter-container [x-dir-text='UF']");
	  
	  await page.waitForSelector("div.qv-listbox-search > div > input");
	  await page.type("div.qv-listbox-search > div > input", state, {delay: 20});
	  
	  await page.keyboard.press('Enter');

      await page.waitForTimeout(2000);
      
      const data = await page.evaluate(
        () => document.querySelector("html").outerHTML
      );
      
      await browser.close();
      
      resolve(data);
    })();
  });
};