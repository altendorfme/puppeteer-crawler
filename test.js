const crawler = require("./crawler");
const am = require("./am");
const fs = require("fs");

(async () => {
  const buffer = await am();
  fs.writeFileSync("viz.json", buffer.toString("binary"), "binary");
})();
