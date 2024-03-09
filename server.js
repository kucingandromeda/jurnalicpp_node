///set up phase

//set up path
const path = require("path");

// set up express and body-parser
const bodyParser = require("body-parser");
const express = require("express");
const app = express();
app.use(bodyParser.json());
app.use("db/api", express.static(path.join(__dirname, "db/api")));

//set up cors
const cors = require("cors");
app.use(
  cors({
    origin: "http://localhost:5173/",
  })
);

//set up file system
const fs = require("fs");

//setup mysql
const mysql = require("mysql");

const db = mysql.createConnection({
  host: "103.175.216.188",
  user: "jicpp",
  password: "ADMIN",
  database: "jicpp",
});

// const db = mysql.createConnection({
//   host: "localhost",
//   user: "root",
//   password: "",
//   database: "jicpp",
// });

db.connect(function (err) {
  if (err) throw err;
  console.log("db is Connected!");
});

//multer
const multer = require("multer");
const disk = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "db/api");
  },
  filename: (req, file, cb) => {
    if (file.mimetype.includes("json")) {
      const filename = file.originalname.replace(/ /g, "-");
      cb(null, filename);
    } else {
      const filename = file.originalname.replace(/ /g, "-");
      cb(null, filename);
    }
  },
});

const upload = multer({ storage: disk });

//variable area
// const frontEndUrl = "http://localhost:5173";
const frontEndUrl = "https://jurnalicpp.online";

//exe phase

// app.get("/newsData", (req, res) => {
//   fs.readFile(
//     "./database/newsData.json",
//     { encoding: "utf-8" },
//     (err, data) => {
//       res.header("Access-Control-Allow-Origin", frontEndUrl);
//       res.send(data);
//     }
//   );
// });

app.get("/newsData/:value", (req, res) => {
  res.header("Access-Control-Allow-Origin", frontEndUrl);
  if (req.params.value === "all") {
    db.query("SELECT * FROM a_news_data", (err, result) => {
      res.send(result);
    });
  }
});

app.get("/getData/:value", (req, res, next) => {
  const request = req.params.value;
  fs.readFile(
    `./db/api/${request}.json`,

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
  const url = path.join(__dirname, `db/api/${req.params.img}`);
  res.sendFile(url);
});

// post

app.post("/admin/publish", upload.array("file"), (req, res) => {
  const body = req.body;
  res.header("Access-Control-Allow-Origin", frontEndUrl);
  req.files.forEach((data) => {
    if (data.mimetype.includes("json")) {
      const fileName = data.filename.replace(".json", "");
      const fileIMG = `${fileName}IMG.png`;
      const url = fileName.replace(/ /g, "-");
      db.query(
        "INSERT INTO a_news_data (id, judul, penulis, genre, img, url) VALUES (?, ?, ? ,? ,? ,?)",
        [null, fileName, body.penulis, body.genre, fileIMG, url],
        (err, result) => {}
      );
    }
  });

  res.redirect(frontEndUrl + "/admin");
});

app.listen(8000, () => {
  console.log("server running");
});
