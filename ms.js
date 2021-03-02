const puppeteer = require("puppeteer");
const mysql = require('mysql');
const config = require("./config");
const db = config.database;

const connection = mysql.createConnection({
  host: db.host,
  user: db.user,
  password: db.password,
  database: db.database
});

(async () => {
  const numberPattern = /\d+/g;

  async function parseStates(state){  
    console.log('State: '+state);

    const browser = await puppeteer.launch({
      //headless: true, // debug only
      args: ["--no-sandbox"],
    });
  
    const page = await browser.newPage();
  
    await page.setViewport({width: 1366, height: 768});
  
    await page.goto('https://viz.saude.gov.br/extensions/DEMAS_C19Vacina/DEMAS_C19Vacina.html', {
      waitUntil: ['load', 'domcontentloaded','networkidle0'],
    });

    await page.waitForSelector('.paper-header .filter-drawer-toggle:nth-child(4) > #icon');
    await page.click('.paper-header .filter-drawer-toggle:nth-child(4) > #icon');
    await page.waitForTimeout(1500);

    await page.waitForSelector(".filter-container [x-dir-text='UF']");
    await page.click(".filter-container [x-dir-text='UF']");
    await page.waitForTimeout(2000);

    await page.waitForSelector("div.qv-listbox-search > div > input");
    await page.type("div.qv-listbox-search > div > input", state, { delay: 20 });

    await page.keyboard.press('Enter');
    await page.waitForTimeout(2500);

    const data1 = await page.evaluate(
      () => document.querySelector('#KPI-12 .qv-object-content-container .value-wrapper span').innerHTML
    );
    const dose_1 = data1.match(numberPattern).join('');
    const data2 = await page.evaluate(
      () => document.querySelector('#KPI-13 .qv-object-content-container .value-wrapper span').innerHTML
    );
    const dose_2 = data2.match(numberPattern).join('');

    await browser.close();

    console.log('Dose 1: '+dose_1);
    console.log('Dose 2: '+dose_2);

    const select = "SELECT `doses_1`,`doses_2` FROM `ms` WHERE `iso_code` = '"+state.toLowerCase()+"' LIMIT 1";
    connection.query(select, function (err, result) {
      if (result.length > 0) {
        const update = "UPDATE `ms` SET `doses_1` = "+dose_1+", `doses_2` = "+dose_2+", `last_update` = now() WHERE `iso_code` = '"+state.toLowerCase()+"' LIMIT 1;";
        connection.query(update, function (err, result) {
          console.log("1 record updated, State: " + state);
        });
      } else {
        const insert = "INSERT INTO `ms` ( `iso_code`, `doses_1`, `doses_2`, `last_update`) VALUES ( '"+state.toLowerCase()+"', "+dose_1+", "+dose_2+", now() );";
        connection.query(insert, function (err, result) {
          console.log("1 record inserted, State: " + state);
        });
      }
    });

  };
  
  connection.connect();
  let states = ['SP', 'MG', 'RJ', 'BA', 'PR', 'RS', 'PE', 'CE', 'PA', 'SC', 'MA', 'GO', 'AM', 'ES', 'PB', 'RN', 'MT', 'AL', 'PI', 'DF', 'MS', 'SE', 'RO', 'TO', 'AC', 'AP', 'RR'];
  //let states = ['SP', 'MG'];
  for(var i = 0; i < states.length; i++) {
    await parseStates(states[i]);
  };

  connection.end();
})();
