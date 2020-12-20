var path = require('path');
var express = require('express');
var exphbs = require("express-handlebars");

var app = express();
//app.engine("handlebars", exphbs( {defaultLayout: none} ));
app.set("view engine", "handlebars");
var port = process.env.PORT || 3000;

const { mainModule } = require('process');
const { NONAME } = require('dns');

app.use(express.static('public'));

app.listen(port, function () {
  console.log("== Server is listening on port", port);
});

app.get("/",function(req, res, next) {
	res.status(200).send("public/index.html");
});