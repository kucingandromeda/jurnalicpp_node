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
app.use("api", express.static(path.join(__dirname, "api")));

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

const multerMemory = multer.memoryStorage();

const filterMulter = (req, file, cb) => {
  if (file.mimetype.includes("image") || file.mimetype.includes("html")) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({ storage: multerMemory, fileFilter: filterMulter });

//exe phase

app.get("/newsData/:value", (req, res) => {
  res.header("Access-Control-Allow-Origin", frontEndUrl);
  if (req.params.value === "all") {
    db.query(
      `SELECT * FROM a_news_index
    ORDER BY id DESC, judul DESC, penulis DESC, genre DESC, img DESC, url DESC`,
      (err, result) => {
        res.send(result);
      }
    );
  } else {
    db.query(
      `SELECT * FROM a_news_index WHERE url = '${req.params.value}'`,
      (err, result) => {
        res.send(result);
      }
    );
  }
});

app.get("/getData/:value", (req, res, next) => {
  const request = req.params.value;
  res.sendFile(path.join(__dirname, `./api/${request}/${request}.html`));
});

app.get("/getImg/:url/:img", (req, res, next) => {
  res.header("Access-Control-Allow-Origin", frontEndUrl);
  const url = path.join(__dirname, `api/${req.params.url}/${req.params.img}`);
  res.sendFile(url);
});

app.get("/getSection/:type", (req, res) => {
  if (req.params.type === "news") {
    db.query(
      `SELECT * FROM a_news_index
    ORDER BY id DESC, judul DESC, penulis DESC, genre DESC, img DESC, url DESC`,
      (err, result) => {
        res.send(result);
      }
    );
  } else {
    db.query(
      `SELECT * FROM a_news_index WHERE genre='${req.params.type}'
      ORDER BY id DESC, judul DESC, penulis DESC, genre DESC, img DESC, url DESC`,
      (err, result) => {
        res.send(result);
      }
    );
  }
});

// post

app.post("/admin/publish", upload.array("files"), (req, res) => {
  if (!req.files[0])
    return res.send('"sepertinya ini bukan HTML ataupun image yah"');

  const urlRaw = req.files.find((data) => data.mimetype.includes("html"));
  const judul = urlRaw.originalname.slice(0, -5);

  db.query(
    `SELECT judul FROM a_news_index WHERE judul='${judul}'`,
    (err, result) => {
      if (err) throw err;
      if (result.length > 0)
        return res.send('"maaf bro sepertinya judul udh kepakai"');
      const url = urlRaw.originalname.slice(0, -5).replace(/ /g, "-");
      req.files.forEach((data) => {
        if (data.mimetype.includes("html")) {
          const penulis = req.body.penulis;
          const genre = req.body.genre;
          const img = JSON.parse(req.body.imgStat)
            ? req.files.find((data) => data.mimetype.includes("image"))
            : null;
          const buffer = Buffer.from(data.buffer);
          console.log(img);

          fs.readdir("./api", { encoding: "utf-8" }, (err, files) => {
            if (!files.find((folder) => folder === url)) {
              db.query(
                "INSERT INTO a_news_index (id, judul, penulis, genre, img, url) VALUES (?, ?, ?, ?, ?, ?)",
                [
                  null,
                  judul,
                  penulis,
                  genre,
                  img ? img.originalname : null,
                  url,
                ],
                (err, result) => {
                  if (err) throw err;
                  fs.mkdir(`api/${url}`, (err) => {
                    fs.writeFile(`api/${url}/${url}.html`, buffer, (err) => {
                      if (err) throw err;
                    });
                  });
                }
              );
            } else {
              db.query(
                "INSERT INTO a_news_index (id, judul, penulis, genre, img, url) VALUES (?, ?, ?, ?, ?, ?)",
                [
                  null,
                  judul,
                  penulis,
                  genre,
                  img ? img.originalname : null,
                  url,
                ],
                (err, result) => {
                  if (err) throw err;

                  fs.writeFile(`api/${url}/${url}.html`, buffer, (err) => {
                    if (err) throw err;
                  });
                }
              );
            }
          });
        } else {
          const imgBuffer = Buffer.from(data.buffer);

          fs.readdir("./api", { encoding: "utf-8" }, (err, files) => {
            if (!files.find((folder) => folder === url)) {
              fs.mkdir(`api/${url}`, (err) => {
                fs.writeFile(
                  `api/${url}/${data.originalname}`,
                  imgBuffer,
                  (err) => {
                    if (err) throw console.log("eror");
                    res.send('"woke"');
                  }
                );
              });
            } else {
              fs.writeFile(
                `api/${url}/${data.originalname}`,
                imgBuffer,
                (err) => {
                  if (err) throw console.log("eror");
                  res.send('"woke"');
                }
              );
            }
          });
        }
      });
    }
  );
});

//edit

app.post("/admin/edit", upload.single("atribut"), (req, res) => {
  if (!req.body.id || !req.body.Bjudul || !req.body.atribut || !req.body.new)
    return res.send('"sepertinya data tidak lengkap"');

  if (req.body.atribut === "judul") {
    console.log(req.body);
    db.query(
      `UPDATE a_news_index SET ${req.body.atribut}='${req.body.new}' WHERE id=${req.body.id}`,
      (err, result) => {
        if (err) throw err;
        if (result.affectedRows === 0) return res.send(`"affectedRows is 0"`);

        const url = req.body.new.replace(/ /g, "-");
        db.query(
          `UPDATE a_news_index SET url='${url}' WHERE id=${req.body.id}`,
          (err, result) => {
            if (err) throw err;

            fs.rename(
              `api/${req.body.Bjudul}/${req.body.Bjudul}.html`,
              `api/${req.body.Bjudul}/${url}.html`,
              (err) => {
                if (err) throw err;

                fs.rename(`api/${req.body.Bjudul}`, `api/${url}`, (err) => {
                  if (err) throw err;

                  res.send('"sudah mengubah judul"');
                });
              }
            );
          }
        );
      }
    );
  } else {
    db.query(
      `UPDATE a_news_index SET ${req.body.atribut}='${req.body.new}' WHERE id=${req.body.id}`,
      (err, result) => {
        if (err) throw err;
        if (result.affectedRows === 0) return res.send(`"affectedRows is 0"`);

        res.send('"Berhasil diubah"');
      }
    );
  }
});

//del

app.post("/admin/del", upload.array("id"), (req, res) => {
  if (!req.body.id || !req.body.Bjudul)
    return res.send(`"maaf data sepertinya ada yang kurang"`);

  db.query(
    `SELECT id FROM a_news_index WHERE id=${req.body.id}`,
    (err, result) => {
      if (err) throw err;
      if (result.length == 0) return res.send('"data tidak ditemukan"');

      db.query(
        `DELETE FROM a_news_index WHERE id=${req.body.id}`,
        (err, result) => {
          if (err) throw err;
          console.log("sudah dihapus di db");

          fs.rm(`api/${req.body.Bjudul}`, { recursive: true }, (err) => {
            if (err) throw err;

            console.log("sudah dihapus di dir");
            res.send(`"berhasil menghapus guys"`);
          });
        }
      );
    }
  );
});

app.listen(8000, () => {
  console.log("server running");
});
