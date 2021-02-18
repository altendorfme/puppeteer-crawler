const puppeteer = require("puppeteer");

module.exports = function (url) {
  return new Promise((resolve, reject) => {
    (async () => {
      const browser = await puppeteer.launch({
        //headless: true, // debug only
        args: ["--no-sandbox"],
      });

      const page = await browser.newPage();

      await page.setViewport({width: 1366, height: 768});
    
      await page.goto(url, {
        waitUntil: ['load', 'domcontentloaded','networkidle0'],
      });

      const numberPattern = /\d+/g;
      const doses_per_state = {};

      async function parseStates(state){  
        console.log('State: '+state);
        const total = [];

        await page.waitForTimeout(1000);

        await page.waitForSelector('.paper-header .filter-drawer-toggle:nth-child(4) > #icon');
        await page.click('.paper-header .filter-drawer-toggle:nth-child(4) > #icon');

        await page.waitForSelector(".filter-container [x-dir-text='UF']");
        await page.click(".filter-container [x-dir-text='UF']");

        await page.waitForSelector("div.qv-listbox-search > div > input");
        await page.type("div.qv-listbox-search > div > input", state, { delay: 20 });

        await page.keyboard.press('Enter');
        await page.waitForTimeout(2000);

        const data1 = await page.evaluate(
          () => document.querySelector('#KPI-12 .qv-object-content-container .value-wrapper span').innerHTML
        );
        const dose_1 = data1.match(numberPattern).join('');
        const data2 = await page.evaluate(
          () => document.querySelector('#KPI-13 .qv-object-content-container .value-wrapper span').innerHTML
        );
        const dose_2 = data2.match(numberPattern).join('');

        await page.evaluate(
          () => document.querySelector('#clearselections').click()
        );
        await page.waitForTimeout(2000);

        console.log('Dose 1: '+dose_1);
        console.log('Dose 2: '+dose_2);

        doses_per_state[state] = [ dose_1, dose_2 ];

        console.log(doses_per_state);
      };

      let states = ['SP', 'MG', 'RJ', 'BA', 'PR', 'RS', 'PE', 'CE', 'PA', 'SC', 'MA', 'GO', 'AM', 'ES', 'PB', 'RN', 'MT', 'AL', 'PI', 'DF', 'MS', 'SE', 'RO', 'TO', 'AC', 'AP', 'RR'];
      //let states = ['SP', 'MG'];
      for(var i = 0; i < states.length; i++) {
        await parseStates(states[i]);
      };

      await browser.close();
      
      resolve(JSON.stringify(doses_per_state));
    })();
  });
};