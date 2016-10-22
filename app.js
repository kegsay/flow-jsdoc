#!/usr/bin/env node
"use strict";

var fs = require("fs");
var nopt = require("nopt");
var path = require("path");
var glob = require("glob");
var mkdirp = require("mkdirp");
var jsdocFlow = require("./index");

var opts = nopt({
    "file": path,
    "directory": path,
    "outdir": path,
    "copy": Boolean,
    "skip": Boolean
}, {
    "f": "--file",
    "d": "--directory",
    "o": "--outdir",
    "c": "--copy",
    "s": "--skip"
});

if (opts.file) {
    console.log(
        jsdocFlow(fs.readFileSync(opts.file, "utf8"))
    );
}
else if (opts.directory && opts.outdir) {
    var absDirectory = path.resolve(opts.directory);
    var absOutDirectory = path.resolve(opts.outdir);
    // make directory if not exists
    try {
        fs.mkdirSync(absOutDirectory);
    }
    catch (e) {
        if (e.code !== "EEXIST") {
            throw e;
        }
    }
    var fileExt = opts.copy ? "*" : "js";
    glob(absDirectory + "/**/*." + fileExt, function(err, files) {
        if (err) {
            console.error(err);
            process.exit(1);
            return;
        }
        files.forEach(function(fpath) {
            // snip the absolute part to get the directory structure for outdir
            // Also make sure we're speaking the same slashes
            var relativeDir = fpath.replace(absDirectory.replace(/\\/g, "/"), "");
            var outFilePath = path.join(absOutDirectory, relativeDir);
            // make directories after stripping filename
            mkdirp.sync(path.dirname(outFilePath));

            if (opts.copy && path.extname(fpath) !== ".js") {
                // copy it over. We don't know how big this is so use streams
                var rs = fs.createReadStream(fpath);
                rs.on("error", function(err) {
                    console.error(err);
                    process.exit(1);
                });
                var ws = fs.createWriteStream(outFilePath);
                ws.on("error", function(err) {
                    console.error(err);
                    process.exit(1);
                });
                rs.pipe(ws);
                return;
            }
            console.log(fpath);
            var input = fs.readFileSync(fpath, "utf8");
            var output;
            try {
                output = jsdocFlow(input);
            }
            catch(err) {
                if (opts.skip) {
                    console.log("    Failed to parse: " + err);
                    output = input;
                }
                else {
                    throw err;
                }
            }
            fs.writeFileSync(outFilePath, output);
        });
    });
}
else {
    console.log("Convert JSDoc comments in a file to Flow annotations");
    console.log("Usage:");
    console.log("  flow-jsdoc -f FILEPATH");
    console.log("  flow-jsdoc -d PATH -o PATH [-c]");
    console.log("Options:");
    console.log(" -f, --file FILEPATH    The .js file with JSDoc to convert. Prints to stdout.");
    console.log(" -d, --directory PATH   The directory with .js files to convert. Will inspect recursively.");
    console.log(" -o, --outdir PATH      Required if -d is set. The output directory to dump flow-annotated files to.");
    console.log(" -c, --copy             Set to copy other file extensions across to outdir.");
    console.log(" -s, --skip             Set to copy over .js files which cannot be parsed correctly (e.g. invalid ES6) to outdir.");
    console.log("File Usage:\n  flow-jsdoc -f path/to/file.js");
    console.log("Directory Usage:\n  flow-jsdoc -d path/to/dir -o out/dir -c");
    process.exit(0);
}
