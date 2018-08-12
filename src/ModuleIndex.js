const VerseScheme = require('./VerseScheme');

let start = 0;
let buf = null;
let isEnd = false;

/**
 * Index of all book, chapter and verse entry points in a Sword module.
 */
class ModuleIndex {
  constructor(files, config) {
    this.oldTestament = {};
    this.newTestament = {};

    Object.entries(files).forEach(([name, file]) => {
      if (name.includes('ot.bzs')) {
        this.oldTestament.bookPositions = file;
      } else if (name.includes('ot.bzv')) {
        this.oldTestament.chapterVersePositions = file;
      } else if (name.includes('ot.bzz')) {
        this.oldTestament.binary = file;
      } else if (name.includes('nt.bzs')) {
        this.newTestament.bookPositions = file;
      } else if (name.includes('nt.bzv')) {
        this.newTestament.chapterVersePositions = file;
      } else if (name.includes('nt.bzz')) {
        this.newTestament.binary = file;
      }
    });

    const versification = config.Versification;

    const bookPosOT = this.getBookPositions(this.oldTestament.bookPositions);
    const rawPosOT = this.getChapterVersePositions(this.oldTestament.chapterVersePositions,
      bookPosOT, 'ot', versification);

    const bookPosNT = this.getBookPositions(this.newTestament.bookPositions);
    const rawPosNT = this.getChapterVersePositions(this.newTestament.chapterVersePositions,
      bookPosNT, 'nt', versification);

    this.rawPosOT = rawPosOT;
    this.rawPosNT = rawPosNT;
    this.binaryOT = this.oldTestament.binary;
    this.binaryNT = this.newTestament.binary;
    this.config = config;
  }


  static blobToBuffer(blob) {
    const buffer = new Buffer.alloc(blob.byteLength);
    const view = new Uint8Array(blob);
    for (let i = 0; i < buffer.length; i += 1) {
      buffer[i] = view[i];
    }
    return buffer;
  }

  // Get the positions of each book
  getBookPositions(inBuf) {
    let startPos = 0,
      length = 0,
      unused = 0,
      res = null,
      end = false,
      bookPositions = [];
    start = 0;

    while (!end) {
      res = this.getIntFromStream(inBuf);
      startPos = res[0];
      end = res[1];
      if (!end) {
        res = this.getIntFromStream(inBuf);
        length = res[0];
        end = res[1];
        if (!end) {
          res = this.getIntFromStream(inBuf);
          unused = res[0];
          end = res[1];
          if (end) { break; }
          bookPositions.push({ startPos, length, unused });
        }
      }
    }
    return bookPositions;
  }

  // dump some bytes in the chapter and verse index file
  dumpBytes(inBuf) {
    start = 0;

    for (let i = 0; i < 4; i += 1) {
      this.getShortIntFromStream(inBuf);
      this.getInt48FromStream(inBuf);
      this.getShortIntFromStream(inBuf);
    }
  }
  // ### This code is based on the zTextReader class from cross-connect (https://code.google.com/p/cross-connect), Copyright (C) 2011 Thomas Dilts ###

  // Get the position of each chapter and verse
  getChapterVersePositions(inBuf, inBookPositions, inTestament, inV11n) {
    this.dumpBytes(inBuf);
    const booksStart = (inTestament === 'ot') ? 0 : VerseScheme.getBooksInOT(inV11n);
    const booksEnd = (inTestament === 'ot') ? VerseScheme.getBooksInOT(inV11n) : VerseScheme.getBooksInOT(inV11n) + VerseScheme.getBooksInNT(inV11n);
    let chapterStartPos = 0,
      lastNonZeroStartPos = 0,
      length = 0,
      chapterLength = 0,
      bookStartPos = 0,
      booknum = 0,
      verseMax = 0,
      bookData = null,
      startPos = 0,
      chapt = {},
      foundEmptyChapter = 0,
      chapters = {};

    for (let b = booksStart; b < booksEnd; b++) {
      bookData = VerseScheme.getBook(b, inV11n);
      chapters[bookData.abbrev] = [];
      foundEmptyChapter = 0;
      // console.log(bookData, chapters);
      for (let c = 0; c < bookData.maxChapter; c++) {
        chapterStartPos = 0;
        lastNonZeroStartPos = 0;
        chapt = {};
        chapt.verses = [];
        length = 0;
        verseMax = VerseScheme.getVersesInChapter(b, c + 1, inV11n);
        for (let v = 0; v < verseMax; v++) {
          booknum = this.getShortIntFromStream(inBuf)[0];
          startPos = this.getInt48FromStream(inBuf)[0];

          if (startPos !== 0) { lastNonZeroStartPos = startPos; }

          length = this.getShortIntFromStream(inBuf)[0];
          // console.log('startPos, length', startPos, length);
          if (v === 0) {
            chapterStartPos = startPos;
            bookStartPos = 0;
            if (booknum < inBookPositions.length) {
            // console.log('inBookPositions.startPos', inBookPositions[booknum].startPos, booknum, inBookPositions.length);
              bookStartPos = inBookPositions[booknum].startPos;
            }
            chapt.startPos = chapterStartPos;
            chapt.booknum = b;
            // chapt['bookRelativeChapterNum'] = c;
            chapt.bookStartPos = bookStartPos;
          }
          if (booknum === 0 && startPos === 0 && length === 0) {
            if (chapt !== {}) {
              chapt.verses.push({ startPos: 0, length: 0 });
            }
          } else if (chapt !== {}) {
            chapt.verses.push({ startPos: startPos - chapterStartPos, length });
          }
        } // end verse
        if (chapt != {}) {
        // console.log('LENGTH:', lastNonZeroStartPos, chapterStartPos, length, c, chapt, chapters);
          chapterLength = lastNonZeroStartPos - chapterStartPos + length;
          chapt.length = chapterLength;
          chapters[bookData.abbrev].push(chapt);
          if (isNaN(chapterLength) || chapterLength === 0) {
            foundEmptyChapter++;
          }
        }
        // dump a post for the chapter break
        this.getShortIntFromStream(inBuf);
        this.getInt48FromStream(inBuf);
        this.getShortIntFromStream(inBuf);
      } // end chapters
      // console.log('Empty Chapters:', foundEmptyChapter);
      if (foundEmptyChapter === bookData.maxChapter) {
        delete chapters[bookData.abbrev];
      }
      // dump a post for the book break
      this.getShortIntFromStream(inBuf);
      this.getInt48FromStream(inBuf);
      this.getShortIntFromStream(inBuf);
    } // end books
    return chapters;
  }

  getRawPositions(inFile, inTestament, inV11n) {
    start = 0;
    // Dump the first 12 bytes
    this.getInt48FromStream(inFile);
    this.getInt48FromStream(inFile);

    const booksStart = (inTestament === 'ot') ? 0 : VerseScheme.getBooksInOT(inV11n);
    const booksEnd = (inTestament === 'ot') ? VerseScheme.getBooksInOT(inV11n) : VerseScheme.getBooksInOT(inV11n) + VerseScheme.getBooksInNT(inV11n);
    let length = 0,
      verseMax = 0,
      bookData = null,
      startPos = 0,
      data = {},
      osis = '';

    for (let b = booksStart; b < booksEnd; b++) {
      bookData = VerseScheme.getBook(b, inV11n);
      // Skip Book Record (6 bytes)
      this.getIntFromStream(inFile);
      this.getShortIntFromStream(inFile);
      for (let c = 0; c < bookData.maxChapter; c++) {
        verseMax = VerseScheme.getVersesInChapter(b, c + 1, inV11n);

        // Skip Chapter Record
        this.getIntFromStream(inFile);
        this.getShortIntFromStream(inFile);


        for (let v = 0; v < verseMax; v++) {
          startPos = this.getIntFromStream(inFile)[0];
          length = this.getShortIntFromStream(inFile)[0];
          if (length !== 0) {
          // console.log('VERSE', startPos, length);
            osis = `${bookData.abbrev}.${parseInt(c + 1, 10)}.${parseInt(v + 1, 10)}`;
            data[osis] = { startPos, length };
          }
        } // end verse
      } // end chapters
    } // end books
    return data;
  }

  getIntFromStream(inBuf) {
    buf = inBuf.subarray(start, start + 4);
    isEnd = false;
    start += 4;
    if (buf.length !== 4) { isEnd = true; }
    return [buf[3] * 0x100000 + buf[2] * 0x10000 + buf[1] * 0x100 + buf[0], isEnd];
  }

  getShortIntFromStream(inBuf, inCallback) {
    buf = inBuf.subarray(start, start + 2);
    isEnd = false;
    start += 2;
    if (buf.length !== 2) { isEnd = true; }
    if (inCallback) { inCallback(buf[1] * 0x100 + buf[0], isEnd); }
    return [buf[1] * 0x100 + buf[0], isEnd];
  }

  getInt48FromStream(inBuf, inCallback) {
    buf = inBuf.subarray(start, start + 6);
    isEnd = false;
    start += 6;
    if (buf.length !== 6) { isEnd = true; }
    if (inCallback) { inCallback(buf[1] * 0x100000000000 + buf[0] * 0x100000000 + buf[5] * 0x1000000 + buf[4] * 0x10000 + buf[3] * 0x100 + buf[2], isEnd); }
    return [buf[1] * 0x100000000000 + buf[0] * 0x100000000 + buf[5] * 0x1000000 + buf[4] * 0x10000 + buf[3] * 0x100 + buf[2], isEnd];
  }
}

module.exports = ModuleIndex;
