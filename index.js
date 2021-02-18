const express = require("express");
const app = express();
const port = process.env.PORT || 3131;
const crawler = require("./crawler");
const am = require("./am");
const viz = require("./viz");

app.get("/", (req, res) => res.status(200).json({ status: "ok" }));

app.get("/crawler", (req, res) => {
  const url = req.query.url;
  (async () => {
    const buffer = await crawler(url);
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.setHeader('Content-Type', 'multipart/form-data; boundary=something')
    res.send(buffer);
  })();
});

app.get("/am", (req, res) => {
  const url = req.query.url;
  (async () => {
    const buffer = await am(url);
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    res.send(buffer);
  })();
});

app.get("/viz", (req, res) => {
  const url = req.query.url;
  (async () => {
    const buffer = await viz(url);
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    res.send(buffer);
  })();
});

app.listen(port, () => console.log(`app listening on port ${port}!`));
