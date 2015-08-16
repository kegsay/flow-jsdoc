"use strict";

var fs = require("fs");
var nopt = require("nopt");
var path = require("path");
var jsdocFlow = require("./index");

var opts = nopt({
    "file": path
}, {
    "f": "--file"
});

if (!opts.file) {
    console.log("Usage: node app.js -f path/to/file.js");
    process.exit(1);
    return;
}

console.log(
    jsdocFlow(fs.readFileSync(opts.file, "utf8"))
);