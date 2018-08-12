/**
 * This code sample uses Node.js.
 *
 * Other platforms coming soon!
 */
const fs = require('fs');
const sword2json = require('./index');

const filename = './data/ESV2011.zip';
const contents = fs.readFileSync(filename);
const swordModule = sword2json.SwordModule.fromNodeBuffer(contents);
const jsonResult = swordModule.renderText('John 1', {});
console.log(jsonResult);
