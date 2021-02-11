const crawler = require("./crawler");
const am = require("./am");
const fs = require("fs");

(async () => {
  const buffer = await am("https://public.tableau.com/views/Boletim_resumido_vacinas/Painel14?:embed=y&:showVizHome=no");
  fs.writeFileSync("am.data", buffer.toString("binary"), "binary");
})();
