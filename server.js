///set up phase

//set up path
const path = require("path");

// set up express
const express = require("express");
const app = express();
app.use(
  "database/image_data",
  express.static(path.join(__dirname, "database/image_data"))
);

//set up cors
const cors = require("cors");
app.use(
  cors({
    origin: "http://localhost:5173/",
  })
);

//set up file system
const fs = require("fs");

//variable area
// const frontEndUrl = "http://localhost:5173";
const frontEndUrl = "https://jurnalicpp.online";

//exe phase
app.get("/newsData", (req, res) => {
  fs.readFile(
    "./database/newsData.json",
    { encoding: "utf-8" },
    (err, data) => {
      res.header("Access-Control-Allow-Origin", frontEndUrl);
      res.send(data);
    }
  );
});

app.get("/getData/:value", (req, res, next) => {
  const request = req.params.value;
  fs.readFile(
    `./database/api/${request}.json`,

    (err, data) => {
      res.header("Access-Control-Allow-Origin", frontEndUrl);
      res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
      );
      res.send(data);
    }
  );
});

app.get("/getImg/:img", (req, res, next) => {
  res.header("Access-Control-Allow-Origin", frontEndUrl);
  // fs.readFile(
  //   `./database/image_data/${req.params.img}.png`,
  //   { encoding: "base64url" },
  //   (err, data) => {
  //     res.send(data);
  //   }
  // );
  const url = path.join(__dirname, `database/image_data/${req.params.img}`);
  res.sendFile(url);
});

app.listen(8000, () => {
  console.log("server running");
});
