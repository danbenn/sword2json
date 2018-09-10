/**
 * This code sample uses Node.js.
 *
 * Try running it by typing 'node example.js' in your terminal.
 */
const fs = require('fs');
const { SwordModule, ModuleIndex } = require('./index');
// Use included sample file from the repository
const filename = './data/ESV2011.zip';
// Load the file into a Node.js Buffer
const contents = fs.readFileSync(filename);
// Create an index of files relevant to the module
const fileIndex = ModuleIndex.fromNodeBuffer(contents);
// Construct a SwordModule object for accessing those files
const swordModule = new SwordModule(fileIndex);
// Render the result, including formatting information
const jsonResult = swordModule.renderText('Psa 1', {});
// Print the result to your terminal :)
console.log(JSON.stringify(jsonResult));
