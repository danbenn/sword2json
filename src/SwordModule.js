const verseKey = require('./VerseMetadata');
const BlobReader = require('./BlobReader');
const VerseScheme = require('./VerseScheme');
const OsisParser = require('./OsisParser');
const ModuleConfig = require('./ModuleConfig');
const ModuleIndex = require('./ModuleIndex');

/**
 * Set of files which encapsulates a Bible version.
 */
class SwordModule {
  /**
   * @param {ModuleIndex} index - prebuilt file index
   */
  constructor(index) {
    this.rawPosOT = index.rawPosOT;
    this.rawPosNT = index.rawPosNT;
    this.binaryOT = index.binaryOT;
    this.binaryNT = index.binaryNT;
    this.config = index.config;
  }

  /**
   * Initialize from a Node.js buffer.
   * @param {Buffer} buffer - contents of a single .zip file
   * @returns {SwordModule} - module built with given files
   */
  static fromNodeBuffer(buffer) {
    const JSZip = require('jszip');
    const zip = new JSZip(buffer);
    const filenames = Object.keys(zip.files);
    const files = {};
    let moduleConfigFile = null;
    filenames.forEach((name) => {
      files[name] = zip.files[name].asUint8Array();
      if (name.includes('.conf')) {
        moduleConfigFile = files[name];
      }
    });
    const configBuffer = this.blobToBuffer(moduleConfigFile);
    const configString = configBuffer.toString();
    const moduleConfig = new ModuleConfig(configString);
    const index = new ModuleIndex(files, moduleConfig);
    return new SwordModule(index);
  }

  static blobToBuffer(blob) {
    const buffer = new Buffer.alloc(blob.byteLength);
    const view = new Uint8Array(blob);
    for (let i = 0; i < buffer.length; ++i) {
      buffer[i] = view[i];
    }
    return buffer;
  }

  renderText(verseRange) {
    const verseList = verseKey.parseVerseList(verseRange, this.config.Versification);
    let bookChapterVersePosition = null;
    let binaryBlob = null;

    if (this.rawPosOT.hasOwnProperty(verseList[0].book)) {
      bookChapterVersePosition = this.rawPosOT[verseList[0].book];
      binaryBlob = this.binaryOT;
    } else if (this.rawPosNT.hasOwnProperty(verseList[0].book)) {
      bookChapterVersePosition = this.rawPosNT[verseList[0].book];
      binaryBlob = this.binaryNT;
    } else {
      throw new Error('Unable to retrieve book from module');
    }
    const chapterXML = BlobReader.getXMLforChapter(binaryBlob, bookChapterVersePosition,
      verseList, this.config.Encoding);
    return chapterXML;
    // this.config.SourceType, this.config.Direction, inOptions);
  }

  static getJsonFromXML(inRaw, inSource, inDirection, inOptions) {
    // console.log(inRaw, inSource, inDirection, inOptions);
    if (inSource && inSource.toLowerCase() === 'osis') {
      return OsisParser.processText(inRaw, inDirection, inOptions);
    }
    if (inSource && inSource.toLowerCase() === 'thml') {
      return ThmlParser.processText(inRaw, inDirection, inOptions);
    }
    return PlainParser.processText(inRaw, inDirection, inOptions);
  }

  // inOsis can be Matt.3
  getVersesInChapter(inOsis) {
    return VerseScheme.getVersesInChapter(VerseScheme.getBookNum(inOsis.split('.')[0], this.config.Versification), inOsis.split('.')[1], this.config.Versification);
  }
}

module.exports = SwordModule;
