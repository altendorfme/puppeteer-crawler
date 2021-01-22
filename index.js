const express = require("express");
const app = express();
const port = process.env.PORT || 3131;
const crawler = require("./crawler");

app.get("/", (req, res) => res.status(200).json({ status: "ok" }));

app.get("/crawler", (req, res) => {
  const url = req.query.url;
  (async () => {
    const buffer = await crawler(url);
    res.send(buffer);
  })();
});

app.listen(port, () => console.log(`app listening on port ${port}!`));
