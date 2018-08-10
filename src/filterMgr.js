const osis = require('./OsisParser');
const plain = require('./PlainParser');
const thml = require('./ThmlParser');

function processText(inRaw, inSource, inDirection, inOptions) {
  // console.log(inRaw, inSource, inDirection, inOptions);
  if (inSource && inSource.toLowerCase() === 'osis') {
    return osis.processText(inRaw, inDirection, inOptions);
  }
  if (inSource && inSource.toLowerCase() === 'thml') {
    return thml.processText(inRaw, inDirection, inOptions);
  }
  return plain.processText(inRaw, inDirection, inOptions);
}

const filterMgr = {
  processText,
};

module.exports = filterMgr;
