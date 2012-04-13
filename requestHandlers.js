var querystring = require("querystring"),
  fs = require("fs"),
  formidable = require("formidable");

var UPLOAD_DIR = './tmp';
var UPLOAD_FILENAME = '/test.png';
var UPLOADED_FILE = UPLOAD_DIR + UPLOAD_FILENAME;

function start(response, request) {
  console.log("Request handler 'start' was called.");

  var body = '<html>'+
    '<head>'+
    '<meta http-equiv="Content-Type" content="text/html; '+
    'charset=UTF-8" />'+
    '</head>'+
    '<body>'+
    '<form action="/upload" enctype="multipart/form-data" method="post">'+
    '<input type="file" name="upload">'+
    '<input type="submit" value="Upload file" />'+
    '</form>'+
    '</body>'+
    '</html>';

    response.writeHead(200, {"Content-Type": "text/html"});
    response.write(body);
    response.end();
}

function upload(response, request) {
  console.log("Request handler 'upload' was called.");
  var form = new formidable.IncomingForm();
  console.log("about to parse");
  form.uploadDir = UPLOAD_DIR;

  form.parse(request, function(error, fields, files) {
    console.log("parsing done");

    /* Possible error on Windows systems:
       tried to rename to an already existing file */

    fs.rename(files.upload.path, UPLOADED_FILE, function(err) {
      if (err) {
        fs.unlink(UPLOADED_FILE);
        fs.rename(files.upload.path, UPLOADED_FILE);
      }
    });
    response.writeHead(200, {"Content-Type": "text/html"});
    response.write("received image:<br/>");
    response.write("<img src='/show' />");
    response.end();
  });
}

function show(response, request) {
  console.log("Request handler 'show' was called.");
  fs.readFile(UPLOADED_FILE, "binary", function(error, file) {
    if(error) {
      response.writeHead(500, {"Content-Type": "text/plain"});
      response.write(error + "\n");
      response.end();
    } else {
      response.writeHead(200, {"Content-Type": "image/png"});
      response.write(file, "binary");
      response.end();
    }
  });
}

exports.start = start;
exports.upload = upload;
exports.show = show;