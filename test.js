const crawler = require("./crawler");
const fs = require("fs");

(async () => {
  const buffer = await crawler("https://google.com");
  fs.writeFileSync("crawler.data", buffer.toString("binary"), "binary");
})();
