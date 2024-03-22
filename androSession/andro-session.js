const crypto = require("crypto");
const fs = require("fs");

module.exports = {
  req: null,
  res: null,
  exp: null,
  cookie: null,

  // fn

  set: (req, res, exp, cookie) => {
    if (!cookie["connected"]) {
      const id = crypto.randomBytes(16).toString("hex");
      res.cookie("connected", id);
      this.cookie = id;
    }
    this.req = req;
    this.res = res;
    this.exp = exp;
    console.log(cookie);
  },

  showSet: (err, cb) => {
    const androSet = {
      req: this.req,
      res: this.res,
      exp: this.exp,
    };

    return cb(androSet);
  },

  androAdd: () => {
    // console.log(this.cookie);
  },

  ///////

  start: (cookies, res, exp) => {
    // this.monitoring();
    if (cookies.androID) return;

    const data = fs.readFileSync("./androSession/log/log.log", {
      encoding: "utf-8",
    });
    const dataJSON = JSON.parse(data);

    const id = crypto.randomBytes(16).toString("hex");
    const time = new Date();
    const second = time.getSeconds();
    const referenceSecond = Math.floor(second / 60);
    const hours = time.getHours() + referenceSecond;
    const referenceHours = Math.floor(hours / 24);
    dataJSON.push(
      JSON.stringify({
        id: id,
        expired: exp ? exp : null,
      })
    );
    fs.writeFileSync(
      "./androSession/log/log.log",
      JSON.stringify(dataJSON, null, 2)
    );
    res.cookie("androID", id);
  },

  monitoring: () => {
    console.log("monitoring");
  },
};
