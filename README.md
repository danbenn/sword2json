<p align="center">
    <img alt="Step Bible" src="https://i.lensdump.com/i/AgzFix.png" width="546">
</p>

<p align="center">
  Delightful pure Javascript library to read Sword Bible modules

[![Join the chat at https://gitter.im/sword2json/Lobby](https://badges.gitter.im/sword2json/Lobby.svg)](https://gitter.im/sword2json/Lobby?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)


__WARNING__: this code is in alpha, and still under active development.

## Motivation

Want to make a Bible app with a modern translation, but don't know where to start?

This is the library for you! Browse available translations from Crosswire Bible Society [here](https://www.crosswire.org/sword/modules/ModDisp.jsp?modType=Bibles).

### Why Sword?

Sword is the most widely used publisher's data format for making Bible apps and       websites.

It was originally developed in the late 90s by [Crosswire Bible Society](http://crosswire.org/sword).

### Why sword2json?

There are two official libraries for reading Sword modules: [Java](https://github.com/crosswire/jsword) and [C++](https://github.com/bibletime/crosswire-sword-mirror). Neither are particularly friendly to newcomers, and lack good documentation.

`sword2json` was created as a modern solution for building Bible apps and websites using pure Javascript, plus a JSON interface.

Don't be afraid of Typescript! It compiles down to vanilla Javascript, so you can run it anywhere.

## Getting Started


To install in your project:

```
yarn add sword2json
```
or, alternatively:

```
npm install sword2json --save
```

## Tutorial

Here, we'll walk through getting this into your project, right from the beginning.

1. Find and download a Bible version you like from the [Crosswire repository](https://www.crosswire.org/sword/modules/ModDisp.jsp?modType=Bibles). English speaker? Try the [ESV](https://www.crosswire.org/sword/modules/ModInfo.jsp?modName=ESV2011) or the [KJV](https://www.crosswire.org/sword/modules/ModInfo.jsp?modName=KJV).


2. If you don't have an existing Javascript project, you can set one up:
```
mkdir myBibleProject && cd myBibleProject && yarn init
```

Create a `main.js` file:

```
touch main.js
```

3. From that file, access JSON from a specific chapter:

```
const sword2json = require('sword2json');
const fs = require('fs');

const filePath = './path/to/your/file/SomeBibleVersion.zip';
const contents = fs.readFileSync(filePath);
const swordModule = SwordJS.SwordModule.fromNodeBuffer(contents);
const jsonResult = swordModule.renderText('John 1');
console.log(jsonResult);
```

Then, run it from the command line:

```
node main.js
```

### Contributing

Pull requests welcome! We love contributors!

To set up a development environment:

### Prerequisites

1. Install Node.js ([here](https://nodejs.org/en/download/)) and Yarn ([here](https://yarnpkg.com/lang/en/docs/install/))

Not sure if you already have them? Try:

```
node --version
```
and:
```
yarn --version
```

2. Clone the repository:

```
git clone https://github.com/danbenn/sword2json.git && cd sword2json/ && yarn
```

3. Build vanilla Javascript to dist/ folder:

```
yarn build
```

4. Run the sample code to see JSON for Psalm 1. The ESV translation is included out of the box:

```
node example.js
```

5. To run changes you make to Typescript, run:

```
./node_modules/ts-node/dist/bin.js example.js
```

TS-node lets you skip the build step and run Typescript code directly from your terminal.

### Testing

To run the test suite:

```
yarn jest
```

### Getting Help

Stuck? Click on the `chat on gitter` badge at the top of this README to ask for help!

## Authors

* **Dan Bennett** - *Refactoring and JSON filter* - [Github](https://github.com/danbenn)
* **zefanja** - *Initial work of sword.js* - [Github](https://github.com/zefanja)

## License

This project is licensed under the MIT License.

## Acknowledgments
This project would not have been possible without the support of the following people:
* David Instone-Brewer of Tyndale House
* Kevin W.

