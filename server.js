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
const { Console } = require("console");
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

app.get("/newsData/:value", (req, res) => {
  res.header("Access-Control-Allow-Origin", frontEndUrl);
  if (req.params.value === "all") {
    db.query(
      `SELECT * FROM a_news_data
    ORDER BY id DESC, judul DESC, penulis DESC, genre DESC, img DESC, url DESC`,
      (err, result) => {
        res.send(result);
      }
    );
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

app.get("/getSection/:type", (req, res) => {
  if (req.params.type === "news") {
    db.query(
      `SELECT * FROM a_news_data
    ORDER BY id DESC, judul DESC, penulis DESC, genre DESC, img DESC, url DESC`,
      (err, result) => {
        res.send(result);
      }
    );
  } else {
    db.query(
      `SELECT * FROM a_news_data WHERE genre='${req.params.type}'
      ORDER BY id DESC, judul DESC, penulis DESC, genre DESC, img DESC, url DESC`,
      (err, result) => {
        res.send(result);
      }
    );
  }
});

// post

app.post("/admin/publishtest", upload.array("files"), (req, res) => {
  // console.log(req.body);
  res.send({ stat: "woke" });
});

app.post("/admin/publish", upload.array("files"), (req, res) => {
  res.header("Access-Control-Allow-Origin", frontEndUrl);
  if (req.files.length != 0 && req.body.penulis && req.body.genre) {
    req.files.forEach((data, i) => {
      if (data.mimetype.includes("json")) {
        const judul = data.originalname.replace(".json", "");
        const penulis = req.body.penulis;
        const genre = req.body.genre;
        const img = JSON.parse(req.body.imgStat)
          ? `${data.filename.replace(".json", "")}IMG.png`
          : null;

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
      }
    });
  } else {
    res.send({ status: "error", msg: "errrr" });
  }
});

//edit

app.post("/admin/edit", upload.single("atribut"), (req, res) => {
  const stat = {
    dbMysql: false,
    dbDir: false,
  };
  if (req.body.id && req.body.atribut && req.body.new) {
    db.query(
      `UPDATE a_news_data SET ${req.body.atribut}='${req.body.new}' WHERE id=${req.body.id}`,
      (err, result) => {
        if (err) throw err;
        if (result) {
          stat.dbMysql = true;
          fs.readFile(
            `./db/api/${req.body.Bjudul}.json`,
            { encoding: "utf-8" },
            (err, data) => {
              if (err) throw err;
              const dataNews = JSON.parse(data);
              dataNews[req.body.atribut] = req.body.new;

              if (req.body.atribut === "judul") {
                const url = dataNews.judul;
                const newUrl = url.replace(/ /g, "-");
                db.query(
                  `UPDATE a_news_data SET url='${newUrl}' WHERE id=${req.body.id}`,
                  (err, result) => {
                    if (err) throw err;

                    dataNews["url"] = newUrl;
                    fs.rm(`./db/api/${req.body.Bjudul}.json`, (err) => {
                      if (err) throw err;
                      fs.writeFile(
                        `./db/api/${newUrl}.json`,
                        JSON.stringify(dataNews, null, 2),
                        (err) => {
                          if (err) throw err;
                          res.header(
                            "Access-Control-Allow-Origin",
                            frontEndUrl
                          );
                          res.send({ status: "ok" });
                        }
                      );
                    });
                  }
                );
              } else {
                fs.writeFile(
                  `./db/api/${req.body.Bjudul}.json`,
                  JSON.stringify(dataNews, null, 2),
                  (err) => {
                    if (err) throw err;
                    res.header("Access-Control-Allow-Origin", frontEndUrl);
                    res.send({ status: "ok" });
                  }
                );
              }
            }
          );
        }
      }
    );
  } else {
    res.header("Access-Control-Allow-Origin", frontEndUrl);
    res.send({ status: "error", m: "ada data yang tdk lengkap" });
  }
});

app.post("/admin/del", upload.array("id"), (req, res) => {
  res.header("Access-Control-Allow-Origin", frontEndUrl);
  const stat = {
    dbMysql: false,
    dbDir: false,
  };
  db.query(`DELETE FROM a_news_data WHERE id=${req.body.id}`, (err, result) => {
    if (err) throw err;

    if (result.affectedRows != 0) {
      stat.dbMysql = true;
      fs.rm(`./db/api/${req.body.Bjudul}.json`, (err) => {
        if (err) throw err;
        if (req.body.img != "null") {
          fs.rm(`./db/api/${req.body.img}`, (err) => {
            if (err) throw err;

            stat.dbDir = true;
            res.header("Access-Control-Allow-Origin", frontEndUrl);
            res.send(`" dbMysql => ${stat.dbMysql} dbDir   => ${stat.dbDir} "`);
          });
        } else {
          stat.dbDir = true;
          res.header("Access-Control-Allow-Origin", frontEndUrl);
          res.send(`" dbMysql => ${stat.dbMysql} dbDir   => ${stat.dbDir} "`);
        }
      });
    } else {
      res.send(`"error terjadi, mungkin karena data ditak ditemukan di db"`);
    }
  });
});

app.listen(8000, () => {
  console.log("server running");
});
