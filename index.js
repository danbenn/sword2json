/**
 * Entry point for NPM package.
 */
const SwordModule = require('./src/SwordModule');
const ModuleIndex = require('./src/ModuleIndex');

const sword2json = {
  SwordModule,
  ModuleIndex,
};

module.exports = sword2json;
