var express = require("express");
var fs = require("fs");
var https = require("https");
var app = express();
var path = require("path");

app.use(express.static(__dirname + "/public"));

app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname + "/index.html"));
});

const options = {
  key: fs.readFileSync("key.pem"),
  cert: fs.readFileSync("cert.pem"),
};

// https.createServer(options, function (req, res) {
//   res.writeHead(200);
//   res.end("hello world\n");
// }).listen(8000);

const port = 8000;

https
  .createServer(options, app)

  .listen(port, function () {
    console.log(
      `Example app listening on port ${port}! Go to https://localhost:${port}/`
    );
  });
