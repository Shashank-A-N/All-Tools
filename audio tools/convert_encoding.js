const fs = require('fs');
const inputFile = process.argv[2];
const outputFile = process.argv[3];
const content = fs.readFileSync(inputFile, 'utf16le');
fs.writeFileSync(outputFile, content, 'utf8');
