const crawler = require("./crawler");
const am = require("./am");
const viz = require("./viz");
const fs = require("fs");

(async () => {
  const buffer = await viz('sp');
  fs.writeFileSync("viz.json", buffer.toString("binary"), "binary");
})();
