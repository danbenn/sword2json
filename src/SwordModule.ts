import ModuleIndex from './ModuleIndex';
import ModuleConfig from './ModuleConfig';
import OsisParser from './OsisParser';
const verseKey = require('./VerseMetadata');
import BlobReader from './BlobReader';
import VerseScheme from './VerseScheme';
import * as types from './types';

/**
 * Set of files which encapsulates a Bible version.
 */
export default class SwordModule {
  rawPosOT: any;
  rawPosNT: any;
  binaryOT: Uint8Array;
  binaryNT: Uint8Array;
  config: ModuleConfig;
  constructor(index: ModuleIndex) {
    this.rawPosOT = index.rawPosOT;
    this.rawPosNT = index.rawPosNT;
    this.binaryOT = index.binaryOT;
    this.binaryNT = index.binaryNT;
    this.config = index.config;
  }

  static blobToBuffer(blob: Uint8Array) {
    const buffer = Buffer.alloc(blob.byteLength);
    const view = new Uint8Array(blob);
    for (let i = 0; i < buffer.length; i += 1) {
      buffer[i] = view[i];
    }
    return buffer;
  }

  getJSON(verseRange: string) {
    const chapterXML = this.getXMLforChapter(verseRange);
    return OsisParser.getJsonFromXML(chapterXML);
  }

  getXMLforChapter(verseRange: string) {
    const verseList = verseKey.parseVerseList(verseRange, this.config.versification);
    let bookPosition: types.ChapterPosition[];
    let binaryBlob: Uint8Array;

    if (this.rawPosOT.hasOwnProperty(verseList[0].book)) {
      bookPosition = this.rawPosOT[verseList[0].book];
      binaryBlob = this.binaryOT;
    } else if (this.rawPosNT.hasOwnProperty(verseList[0].book)) {
      bookPosition = this.rawPosNT[verseList[0].book];
      binaryBlob = this.binaryNT;
    } else {
      throw new Error('Unable to retrieve book from module');
    }
    return BlobReader.getXMLforChapter(binaryBlob, bookPosition,
                                       verseList, this.config.encoding);
  }
}
