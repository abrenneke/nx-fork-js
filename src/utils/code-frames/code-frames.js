"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.codeFrameColumns = void 0;
// Adapted from https://raw.githubusercontent.com/babel/babel/4108524/packages/babel-code-frame/src/index.js
const highlight_1 = require("./highlight");
const chalk = require("chalk");
/**
 * Chalk styles for code frame token types.
 */
function getDefs(chalk) {
    return {
        gutter: chalk.grey,
        marker: chalk.red.bold,
        message: chalk.red.bold,
    };
}
/**
 * RegExp to test for newlines in terminal.
 */
const NEWLINE = /\r\n|[\n\r\u2028\u2029]/;
/**
 * Extract what lines should be marked and highlighted.
 */
function getMarkerLines(loc, source, opts) {
    const startLoc = Object.assign({ column: 0, line: -1 }, loc.start);
    const endLoc = Object.assign(Object.assign({}, startLoc), loc.end);
    const { linesAbove = 2, linesBelow = 3 } = opts || {};
    const startLine = startLoc.line;
    const startColumn = startLoc.column;
    const endLine = endLoc.line;
    const endColumn = endLoc.column;
    let start = Math.max(startLine - (linesAbove + 1), 0);
    let end = Math.min(source.length, endLine + linesBelow);
    if (startLine === -1) {
        start = 0;
    }
    if (endLine === -1) {
        end = source.length;
    }
    const lineDiff = endLine - startLine;
    const markerLines = {};
    if (lineDiff) {
        for (let i = 0; i <= lineDiff; i++) {
            const lineNumber = i + startLine;
            if (!startColumn) {
                markerLines[lineNumber] = true;
            }
            else if (i === 0) {
                const sourceLength = source[lineNumber - 1].length;
                markerLines[lineNumber] = [startColumn, sourceLength - startColumn + 1];
            }
            else if (i === lineDiff) {
                markerLines[lineNumber] = [0, endColumn];
            }
            else {
                const sourceLength = source[lineNumber - i].length;
                markerLines[lineNumber] = [0, sourceLength];
            }
        }
    }
    else {
        if (startColumn === endColumn) {
            if (startColumn) {
                markerLines[startLine] = [startColumn, 0];
            }
            else {
                markerLines[startLine] = true;
            }
        }
        else {
            markerLines[startLine] = [startColumn, endColumn - startColumn];
        }
    }
    return { start, end, markerLines };
}
function codeFrameColumns(rawLines, loc, opts = {}) {
    const defs = getDefs(chalk);
    const lines = rawLines.split(NEWLINE);
    const { start, end, markerLines } = getMarkerLines(loc, lines, opts);
    const numberMaxWidth = String(end).length;
    const highlightedLines = (0, highlight_1.highlight)(rawLines);
    let frame = highlightedLines
        .split(NEWLINE)
        .slice(start, end)
        .map((line, index) => {
        const number = start + 1 + index;
        const paddedNumber = ` ${number}`.slice(-numberMaxWidth);
        const gutter = ` ${paddedNumber} | `;
        const hasMarker = markerLines[number];
        if (hasMarker) {
            let markerLine = '';
            if (Array.isArray(hasMarker)) {
                const markerSpacing = line
                    .slice(0, Math.max(hasMarker[0] - 1, 0))
                    .replace(/[^\t]/g, ' ');
                const numberOfMarkers = hasMarker[1] || 1;
                markerLine = [
                    '\n ',
                    defs.gutter(gutter.replace(/\d/g, ' ')),
                    markerSpacing,
                    defs.marker('^').repeat(numberOfMarkers),
                ].join('');
            }
            return [defs.marker('>'), defs.gutter(gutter), line, markerLine].join('');
        }
        else {
            return ` ${defs.gutter(gutter)}${line}`;
        }
    })
        .join('\n');
    return chalk.reset(frame);
}
exports.codeFrameColumns = codeFrameColumns;
/**
 * Create a code frame, adding line numbers, code highlighting, and pointing to a given position.
 */
function default_1(rawLines, lineNumber, colNumber, opts = {}) {
    colNumber = Math.max(colNumber, 0);
    const location = {
        start: { column: colNumber, line: lineNumber },
    };
    return codeFrameColumns(rawLines, location, opts);
}
exports.default = default_1;
//# sourceMappingURL=code-frames.js.map