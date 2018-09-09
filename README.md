# sword2json

[![Join the chat at https://gitter.im/sword2json/Lobby](https://badges.gitter.im/sword2json/Lobby.svg)](https://gitter.im/sword2json/Lobby?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

```sword2json``` is a pure Javascript library to read Bible modules from [Crosswire Bible Society](http://crosswire.org/sword).

__WARNING__: this code is in alpha, and still under active development.

## Motivation

Sword is the most widely used data format for making Bible apps and websites. 

The  originally developed in the late 90s by [Crosswire Bible Society](http://crosswire.org/sword).

There are two official libraries for reading Sword modules: Java and C++. Neither are particularly friendly to newcomers, and lack good documentation. 

`sword2json` was created as a modern, delightful solution for building Bible apps and websites using pure Javascript.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

You'll need to install Node.js ([here](https://nodejs.org/en/download/)) on your system to use this project.

### Installing

1. Find and download a Bible version you like from [__Crosswire__](https://www.crosswire.org/sword/modules/ModDisp.jsp?modType=Bibles).


2. If you don't have an existing NPM project, you can set one up:
```
$ mkdir myBibleProject
$ cd myBibleProject
$ npm init
```
3. Install the package from NPM:
```
$ npm install sword2json
```
4. Access JSON from a specific chapter:
```
const sword2json = require('sword2json');
const fs = require('fs');

const filePath = './path/to/your/file/SomeBibleVersion.zip';
const contents = fs.readFileSync(filePath);
const swordModule = SwordJS.SwordModule.fromNodeBuffer(contents);
const jsonResult = swordModule.renderText('John 1');
console.log(jsonResult);
```
### Contributing

1. To set up a development environment, clone the repository:
```
$ git clone https://github.com/danbenn/sword2json.git
$ cd sword2json/
$ npm install
```
2. Run the sample code to see JSON for John 1. The ESV translation is included out of the box:

```
$ node example.js
```

### Getting Help

Stuck? Click on the `chat on gitter` badge at the top of this README to ask for help!

## Authors

* **Dan Bennett** - *Refactoring and JSON filter* - [Github](https://github.com/PurpleBooth)
* **zefanja** - *Initial work of sword.js* - [Github](https://github.com/zefanja)

## License

This project is licensed under the GPLv3 License.

## Acknowledgments
This project would not have been possible without the support of the following people: 
* David Instone-Brewer of Tyndale House
* Kevin W.

