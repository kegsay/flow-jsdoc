"use strict";
var fs = require("fs");
var glob = require("glob");
var path = require("path");
var jsdocFlow = require("../index");

var inputDir = path.join(__dirname, "/input");
var outputDir = path.join(__dirname, "/expected_output");

var RED = "\x1b[41m";
var RESET = "\x1b[49m";

glob(inputDir + "/*.js", function(err, files) {
    if (err) {
        console.error(err);
        process.exit(1);
        return;
    }
    var exitCode = 0;
    files.forEach(function(f) {
        f = path.resolve(f); // convert \ to / so we can replace with out dir
        var outFile = f.replace(inputDir, outputDir);
        var expectedOutput = fs.readFileSync(outFile, "utf8");
        var actualOutput = new String(jsdocFlow(fs.readFileSync(f, "utf8")));
        
        var actualOutLines = actualOutput.split("\n");
        var expectedOutLines = expectedOutput.split("\n");
        if (actualOutLines.length === expectedOutLines.length) {
            for (var lineNum = 0; lineNum < actualOutLines.length; lineNum++) {
                if (actualOutLines[lineNum] !== expectedOutLines[lineNum]) {
                    var lineLength = Math.max(actualOutLines[lineNum].length, expectedOutLines[lineNum].length);
                    for (var charNum = 0; charNum < lineLength; charNum++) {
                        if (actualOutLines[lineNum][charNum] !== expectedOutLines[lineNum][charNum]) {
                            var badChar = escape(actualOutLines[lineNum][charNum]);
                            var actualSnippet = snippet(actualOutLines[lineNum], charNum);
                            var expectedSnippet = snippet(expectedOutLines[lineNum], charNum);
                            
                            console.error(
                                "%s:%s:%s %s", outFile, lineNum + 1, charNum + 1,
                                "Unexpected char: '" + badChar + "'. " +
                                "Got \"" + actualSnippet + "\", expected \"" + expectedSnippet + "\"."
                            );
                            exitCode = 1;
                            break;
                        }
                    }
                }
            }
        }
        else {
            console.error(
                "%s:%s %s", outFile, 0,
                "Expected " + expectedOutLines.length + " lines, got " + actualOutLines.length
            );
            exitCode = 1;
        }
    });
    process.exit(exitCode);
});

function snippet(line, charNum) {
    var leftMinSnip = Math.max(charNum - 10, 0);
    var leftMaxSnip = Math.max(charNum - 1, 0);
    var rightMinSnip = Math.min(charNum + 1, line.length);
    var rightMaxSnip = Math.min(charNum + 10, line.length);
    return (
        escape(line.substring(leftMinSnip, leftMaxSnip)) +
        RED + escape(line[charNum]) + RESET +
        escape(line.substring(rightMinSnip, rightMaxSnip))
    );
}

function escape(thing) {
    var escapedThing = JSON.stringify(thing);
    return escapedThing.substring(1, escapedThing.length-1);
}
