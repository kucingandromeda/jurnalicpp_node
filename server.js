///set up phase
// set up express
const express = require("express");
const app = express();

//set up cors
const cors = require("cors");
app.use(
  cors({
    origin: "http://localhost:5173/",
  })
);

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

app.get("/getData/:value", (req, res, next) => {
  const request = req.params.value;
  fs.readFile(
    `./database/api/${request}.txt`,

    (err, data) => {
      res.header("Access-Control-Allow-Origin", "http://localhost:5173");
      res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
      );
      res.send(data);
    }
  );
});

app.listen(8000, () => {
  console.log("server running");
});
