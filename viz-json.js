const viz = require("./viz");
const fs = require("fs");

(async () => {
  const buffer = await viz('https://viz.saude.gov.br/extensions/DEMAS_C19Vacina/DEMAS_C19Vacina.html');
  fs.writeFileSync("viz.json", buffer.toString("binary"), "binary");
})();
