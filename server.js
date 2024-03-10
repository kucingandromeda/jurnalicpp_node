///set up phase

//variable area
const frontEndUrl = "http://localhost:5173";
// const frontEndUrl = "https://jurnalicpp.online";

//set up path
const path = require("path");

// set up express and body-parser
const bodyParser = require("body-parser");
const express = require("express");
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("db/api", express.static(path.join(__dirname, "db/api")));

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", frontEndUrl);
  next();
});

//set up cors
const cors = require("cors");
app.use(
  cors({
    origin: "http://localhost:5173/",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  })
);

//set up file system
const fs = require("fs");

//setup mysql
const mysql = require("mysql");

// const db = mysql.createConnection({
//   host: "103.175.216.188",
//   user: "jicpp",
//   password: "ADMIN",
//   database: "jicpp",
// });

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "jicpp",
});

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

const filterMulter = (req, file, cb) => {
  if (file.mimetype.includes("image") || file.mimetype.includes("json")) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({ storage: disk, fileFilter: filterMulter });

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

// app.post("/admin/publish", upload.array("file"), (req, res) => {
//   const body = req.body;
//   res.header("Access-Control-Allow-Origin", frontEndUrl);
//   req.files.forEach((data) => {
//     if (data.mimetype.includes("json")) {
//       const fileName = data.filename.replace(".json", "");
//       const fileIMG = `${fileName}IMG.png`;
//       const url = fileName.replace(/ /g, "-");
//       db.query(
//         "INSERT INTO a_news_data (id, judul, penulis, genre, img, url) VALUES (?, ?, ? ,? ,? ,?)",
//         [null, fileName, body.penulis, body.genre, fileIMG, url],
//         (err, result) => {
//           if (result) {
//             console.log("publish sucsesss");
//           }
//         }
//       );
//     }
//   });

//   res.send("woke");
// });

app.post("/admin/publish", upload.array("files"), (req, res) => {
  res.header("Access-Control-Allow-Origin", frontEndUrl);
  if (req.files.length != 0 && req.body.penulis && req.body.genre) {
    req.files.forEach((data, i) => {
      if (data.mimetype.includes("json")) {
        const judul = data.originalname.replace(".json", "");
        const penulis = req.body.penulis;
        const genre = req.body.genre;
        const img = req.body.imgStat
          ? null
          : `${data.filename.replace(".json", "")}IMG.png`;
        console.log(img);
        const url = data.filename.replace(".json", "");
        db.query(
          "INSERT INTO a_news_data (id, judul, penulis, genre, img, url) VALUES (?, ?, ?, ?, ?, ?)",
          [null, judul, penulis, genre, img, url],
          (err, result) => {
            if (result) {
              res.send({
                status: "sucsess",
                lengthSend: req.files.length,
                msg: null,
              });
            } else {
              res.send({ status: "err", msg: "db is error" });
            }
          }
        );
        // console.log(`
        // judul = ${judul}
        // penulis = ${penulis}
        // genre = ${genre}
        // img = ${img}
        // url = ${url}
        // `);
      }
    });
  } else {
    res.send({ status: "error", msg: "errrr" });
  }
  // let error = false;

  // if (req.files.length <= 2) {
  //   for (let i = 0; i < req.files.length; i++) {
  //     if (
  //       req.files[i].mimetype.includes("image") ||
  //       req.files[0].mimetype.includes("json")
  //     ) {
  //     } else {
  //       res.send({
  //         status: "error",
  //         msg: "terdeteksi data diluar json dan img",
  //       });
  //       error = true;
  //       break;
  //     }
  //   }

  //   res.send({ status: "sucsess", lengthSend: req.files.length, msg: null });
  // } else {
  //   res.send({
  //     status: "error",
  //     msg: "data yang diterima terdeteksi lebih dari 2",
  //   });
  // }
});

app.listen(8000, () => {
  console.log("server running");
});
