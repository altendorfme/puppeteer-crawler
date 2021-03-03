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
  const browser = await puppeteer.launch({
    //headless: true, // debug only
    args: ["--no-sandbox"],
  });

  const page = await browser.newPage();
  await page.setCacheEnabled(false);

  await page.setViewport({width: 1366, height: 768});

  await page.goto('https://viz.saude.gov.br/extensions/DEMAS_C19Vacina/DEMAS_C19Vacina.html', {
    waitUntil: ['load', 'domcontentloaded','networkidle0'],
  });

  const numberPattern = /\d+/g;

  async function parseStates(state){  
    console.log('State: '+state);

    await page.waitForTimeout(2000);

    await page.waitForSelector('.paper-header .filter-drawer-toggle:nth-child(4) > #icon');
    await page.click('.paper-header .filter-drawer-toggle:nth-child(4) > #icon');
    await page.waitForTimeout(2000);

    await page.waitForSelector(".filter-container [x-dir-text='UF']");
    await page.click(".filter-container [x-dir-text='UF']");
    await page.waitForTimeout(2000);

    await page.waitForSelector("div.qv-listbox-search > div > input");
    await page.type("div.qv-listbox-search > div > input", state, { delay: 20 });

    await page.waitForTimeout(1000);

    await page.keyboard.press('Enter');
    await page.waitForTimeout(3000);

    const data1 = await page.evaluate(
      () => document.querySelector('#KPI-12 .qv-object-content-container .value-wrapper span').innerHTML
    );
    const doses_1 = data1.match(numberPattern).join('');
    const data2 = await page.evaluate(
      () => document.querySelector('#KPI-13 .qv-object-content-container .value-wrapper span').innerHTML
    );
    const doses_2 = data2.match(numberPattern).join('');

    await page.evaluate(
      () => document.querySelector('#clearselections').click()
    );
    await page.waitForTimeout(2000);

    console.log('Dose 1: '+doses_1);
    console.log('Dose 2: '+doses_2);

    const select = "SELECT `doses_1`,`doses_2` FROM `ms` WHERE `iso_code` = '"+state.toLowerCase()+"' LIMIT 1";
    connection.query(select, function (err, result) {
      if ( (doses_1  === '') || (doses_2  === '') ) {
        console.log('Doses empty');
        if (result.length == 0) {
          const drop = "DELETE FROM `ms` WHERE `iso_code` = '"+state+"'";
          connection.query(drop, function (err, result) {
            console.log("1 record deleted, State: " + state);
          });
        }
      } else {
        console.log('Doses not empty');
        if (result.length == 0) {
          const insert = "INSERT INTO `ms` ( `iso_code`, `doses_1`, `doses_2`, `last_update`) VALUES ( '"+state.toLowerCase()+"', "+doses_1+", "+doses_2+", now() );";
          connection.query(insert, function (err, result) {
            console.log("1 record inserted, State: " + state);
          });
        } else {
          if( (doses_1 < ((result[0].doses_1 * 0.2) + result[0].doses_1)) || (doses_2 < ((result[0].doses_2 * 0.2) + result[0].doses_2)) ) {
            const update = "UPDATE `ms` SET `doses_1` = "+doses_1+", `doses_2` = "+doses_2+", `last_update` = now() WHERE `iso_code` = '"+state.toLowerCase()+"' LIMIT 1;";
            connection.query(update, function (err, result) {
              console.log("1 record updated, State: " + state);
            });
          } else {
            console.log("Invalid doses range (20%), State: " + state);
          }
        }
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
  await browser.close();
})();
