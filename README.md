# sword2json

```sword2json``` is a pure Javascript library to read Bible modules from [Crosswire Bible Society](http://crosswire.org/sword).

__WARNING__: this code is in alpha, and still under active development.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

You'll need to install Node.js ([here](https://nodejs.org/en/download/)) and NPM ([here](https://www.npmjs.com/get-npm)) on your system to use this project.

### Installing
To use in your project, install via NPM:
```
$ npm install sword2json
```
To access JSON from a specific verse or chapter:
```
const sword2json = require('sword2json');
const fs = require('fs');

const filename = './path/to/your/file/ESV2011.zip';
const contents = fs.readFileSync(filename);
const swordModule = SwordJS.SwordModule.fromNodeBuffer(contents);
const jsonResult = swordModule.renderText('John 1');
console.log(jsonResult);
```
To set up a development environment, clone the repository:
```
$ git clone https://github.com/danbenn/sword2json.git && cd sword2json/
```
Run the sample code to see JSON for John 1, from the English Standard Version (ESV):

```
$ node example.js
```

## Authors

* **Dan Bennett** - *Refactoring and JSON filter* - [Github](https://github.com/PurpleBooth)
* **zefanja** - *Initial work of sword.js* - [Github](https://github.com/zefanja)

## License

This project is licensed under the GPLv3 License.

## Acknowledgments
This project would not have been possible without the support of the following people: 
* David Instone-Brewer of Tyndale House

