import ModuleIndex from './ModuleIndex';
import ModuleConfig from './ModuleConfig';
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

  getChapterXML(chapterReference: string): types.ChapterXML {
    const verseList = verseKey.parseVerseList(chapterReference, this.config.versification);
    const book: string = verseList[0].book;
    const bookPosition = this.getChapterPositions(book);
    const binaryBlob = this.getBlob(book);
    return BlobReader.getXMLforChapter(binaryBlob, bookPosition,
                                       verseList, this.config.encoding);
  }

  private getBlob(book: string): Uint8Array {
    if (this.rawPosOT.hasOwnProperty(book)) {
      return this.binaryOT;
    }
    if (this.rawPosNT.hasOwnProperty(book)) {
      return this.binaryNT;
    }
    throw new Error('Unable to retrieve book from module');
  }

  private getChapterPositions(book: string): types.ChapterPosition[] {
    if (this.rawPosOT.hasOwnProperty(book)) {
      return this.rawPosOT[book];
    }
    if (this.rawPosNT.hasOwnProperty(book)) {
      return this.rawPosNT[book];
    }
    throw new Error('Unable to retrieve book from module');
  }
}
