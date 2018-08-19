/**
 * This code sample uses Node.js.
 *
 * Other platforms coming soon!
 */
const fs = require('fs');
const sword2json = require('./index');
// Use included sample file from the repository
const filename = './data/ESV2011.zip';
// Load the file into a Node.js Buffer
const contents = fs.readFileSync(filename);
// Create Sword Module object from Buffer
const swordModule = sword2json.SwordModule.fromNodeBuffer(contents);
// Render the result, including formatting information
const jsonResult = swordModule.renderText('Psa 1', {});
// Print the result to your terminal :)
console.log(JSON.stringify(jsonResult));
