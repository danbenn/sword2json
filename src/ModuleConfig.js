/**
 * Configuration settings for a specific module
 */
class ModuleConfig {
  constructor(configString) {
    const lines = configString.split(/[\r\n]+/g);
    this.options = {};

    this.options.GlobalOptionFilter = [];
    this.options.Feature = [];

    lines.forEach((line) => {
      const splittedLine = line.split(/=(.+)/);
      if (splittedLine[0] !== '') {
        if (splittedLine[0].search(/\[.*\]/) !== -1) {
          this.moduleKey = splittedLine[0].replace('[', '').replace(']', '');
        } else if (splittedLine[0] === 'GlobalOptionFilter') {
          this.options[splittedLine[0]].push(splittedLine[1]);
        } else if (splittedLine[0] === 'Feature') {
          this.options[splittedLine[0]].push(splittedLine[1]);
        } else if (splittedLine[0] === 'Versification') {
          this.Versification = splittedLine[1].toLowerCase();
        } else if (splittedLine[0] === 'Encoding') {
          [, this.Encoding] = splittedLine;
        } else {
          [, this.options[splittedLine[0]]] = splittedLine;
        }
      }
    });
  }
}

module.exports = ModuleConfig;
