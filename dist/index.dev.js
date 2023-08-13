"use strict";

var _express = _interopRequireDefault(require("express"));

var _pdfController = require("./controllers/pdfController.js");

var _bodyParser = _interopRequireDefault(require("body-parser"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var app = (0, _express["default"])();
var port = process.env.PORT || 3000;
app.use(_bodyParser["default"].json());
app.use(_bodyParser["default"].urlencoded({
  extended: true
}));
app.post('/parse-pdf', _pdfController.parsePdf); // Start the server

app.listen(port, function () {
  console.log("Server is listening on port ".concat(port));
});