<p align="center">
    <img alt="sword2osis" src="assets/sword2osis.png" width="546">
</p>

<p align="center">
  Lightweight Javascript library to convert Sword modules to OSIS XML

## Motivation

New to the open-source Bible community?

Read a primer at github.com/danbenn/sword2json.

## Getting Started

NOTE: This package has Node dependencies, such as `fs`, `Buffer`, and `stream`.

To install in your project:

```
yarn add sword2osis
```
or, alternatively:

```
npm install sword2osis --save
```

```
const fs = require('fs');
// Import from 'dist', which is Typescript compiled to ES3 (vanilla) Javascript
const { SwordModule, ModuleIndex, NodeDatabase, VerseMetadata } = require('./index');
// Use included sample file from the repository
// File path must be relative to where you run the code
const filePath = './data/ESV2011.zip';
// Load the file into a Node.js Buffer
const contents = fs.readFileSync(filePath);
// Create an index of files relevant to the module
const fileIndex = ModuleIndex.fromNodeBuffer(contents);
// Construct a SwordModule object for accessing those files
const swordModule = new SwordModule(fileIndex);
// [optional] Load Sword module contents into a sqlite database
const jsonResult = swordModule.getVerseXML('Psa 1');
```





