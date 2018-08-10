const verseKey = require('./VerseMetadata');
const BlobReader = require('./BlobReader');
const filterMgr = require('./filterMgr');
const versificationMgr = require('./VerseScheme');


class SwordModule {
  constructor(index) {
    this.config = index.config;
    this.rawPosOT = index.rawPosOT;
    this.rawPosNT = index.rawPosNT;
    this.binaryOT = index.binaryOT;
    this.binaryNT = index.binaryNT;
    this.config = index.config;
  }

  renderText(verseRange, inOptions) {
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

    // const result = filterMgr.processText(inRaw, this.config.SourceType, this.config.Direction, inOptions);
  }

  // inOsis can be Matt.3
  getVersesInChapter(inOsis) {
    return versificationMgr.getVersesInChapter(versificationMgr.getBookNum(inOsis.split('.')[0], this.config.Versification), inOsis.split('.')[1], this.config.Versification);
  }
}

module.exports = SwordModule;
