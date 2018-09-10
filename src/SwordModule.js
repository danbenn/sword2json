const verseKey = require('./VerseMetadata');
const BlobReader = require('./BlobReader');
const VerseScheme = require('./VerseScheme');
const OsisParser = require('./OsisParser');
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

  static blobToBuffer(blob) {
    const buffer = new Buffer.alloc(blob.byteLength);
    const view = new Uint8Array(blob);
    for (let i = 0; i < buffer.length; i += 1) {
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
    return OsisParser.getJsonFromXML(chapterXML.verses, this.config.Direction);
  }
}

module.exports = SwordModule;
