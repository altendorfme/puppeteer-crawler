const crawler = require("./crawler");
const am = require("./am");
const viz = require("./viz");
const fs = require("fs");

(async () => {
  const buffer = await viz('RR');
  fs.writeFileSync("viz.html", buffer.toString("binary"), "binary");
})();
