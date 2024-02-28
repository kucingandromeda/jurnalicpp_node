///set up phase
// set up express
const express = require("express");
const app = express();

//set up file system
const fs = require("fs");

//exe phase
app.get("/newsData", (req, res) => {
  fs.readFile(
    "./database/newsData.json",
    { encoding: "utf-8" },
    (err, data) => {
      res.send(data);
    }
  );
});

app.get("/getData/:value", (req, res) => {
  fs.readFile(
    `./database/api/${req.params.value}.json`,
    { encoding: "utf-8" },
    (err, data) => {
      res.send(data);
      console.log(data);
    }
  );
});

app.listen(8000, () => {
  console.log("server running");
});
