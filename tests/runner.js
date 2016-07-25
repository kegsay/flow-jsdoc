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
    var numFails = 0;
    files.forEach(function(f) {
        f = path.resolve(f); // convert \ to / so we can replace with out dir
        var outFile = f.replace(inputDir, outputDir);
        var expectedOutput = fs.readFileSync(outFile, "utf8");
        var actualOutput = new String(jsdocFlow(fs.readFileSync(f, "utf8")));
        // console.log("EXPECT: " + expectedOutput);
        // console.log("ACTUAL: " + actualOutput);
        var actualOutLines = actualOutput.split("\n");
        var expectedOutLines = expectedOutput.split("\n");
        if (actualOutLines.length === expectedOutLines.length) {
            for (var lineNum = 0; lineNum < actualOutLines.length; lineNum++) {
                if (actualOutLines[lineNum] === expectedOutLines[lineNum]) {
                    continue;
                }
                var lineLength = Math.max(actualOutLines[lineNum].length, expectedOutLines[lineNum].length);
                for (var charNum = 0; charNum < lineLength; charNum++) {
                    if (actualOutLines[lineNum][charNum] === expectedOutLines[lineNum][charNum]) {
                        continue;
                    }
                    var badChar = escape(actualOutLines[lineNum][charNum]);
                    var actualSnippet = snippet(actualOutLines[lineNum], charNum);
                    var expectedSnippet = snippet(expectedOutLines[lineNum], charNum);
                    
                    console.error(
                        "%s:%s:%s %s", outFile, lineNum + 1, charNum + 1,
                        "Unexpected char: '" + badChar + "'. " +
                        "Got \"" + actualSnippet + "\", expected \"" + expectedSnippet + "\"."
                    );
                    numFails += 1;
                    break;
                }
            }
        }
        else {
            console.error(
                "%s:%s %s", outFile, 0,
                "Expected " + expectedOutLines.length + " lines, got " + actualOutLines.length
            );
            numFails += 1;
        }
    });
    console.log("%s test failures out of %s tests.", numFails, files.length);
    process.exit(numFails > 0 ? 1 : 0);
});

function snippet(line, charNum) {
    var leftMinSnip = Math.max(charNum - 15, 0);
    var leftMaxSnip = Math.max(charNum, 0);
    var rightMinSnip = Math.min(charNum + 1, line.length);
    var rightMaxSnip = Math.min(charNum + 15, line.length);
    return (
        escape(line.substring(leftMinSnip, leftMaxSnip)) +
        RED + escape(line[charNum]) + RESET +
        escape(line.substring(rightMinSnip, rightMaxSnip))
    );
}

function escape(thing) {
    if (thing === undefined) {
        return "<missing>";
    }
    var escapedThing = JSON.stringify(thing);
    return escapedThing.substring(1, escapedThing.length-1);
}
