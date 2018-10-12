/**
 * This code sample uses Node.js.
 *
 * Try running it by typing 'node example.js' in your terminal.
 *
 * Need a database? Or want to send JSON through an API? Sweet! Check out
 * the test suite in the 'tests' folder for example usage.
 */
const osis2json = require('./src/osis2json');

// const fs = require('fs');
// // Import from 'dist', which is Typescript compiled to ES3 (vanilla) Javascript
// const { SwordModule, ModuleIndex, NodeDatabase, VerseMetadata } = require('./index');
// // Use included sample file from the repository
// const filename = './data/ESV2011.zip';
// // Load the file into a Node.js Buffer
// const contents = fs.readFileSync(filename);
// // Create an index of files relevant to the module
// const fileIndex = ModuleIndex.fromNodeBuffer(contents);
// // Construct a SwordModule object for accessing those files
// const swordModule = new SwordModule(fileIndex);
// // [optional] Load Sword module contents into a sqlite database
// const jsonResult = swordModule.getJSON('Psa 1');
// // Print the result in your terminal :)
// // console.log(JSON.stringify(jsonResult, null, 2));
