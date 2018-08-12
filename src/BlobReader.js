const pako = require('pako');

/**
 * Converts blobs to XML.
 */
class BlobReader {
  static getXMLforChapter(testamentBlob, positions, verses, encoding) {
    const { chapter } = verses[0];
    if (!positions[chapter - 1]) {
      throw new Error(`can't find chapter ${chapter} in this module`);
    }
    // Assumption is that all verses must have same chapter
    const { bookStartPos } = positions[chapter - 1];
    const { startPos } = positions[chapter - 1];
    const { length } = positions[chapter - 1];
    const chapterStartPos = bookStartPos + startPos;
    const chapterEndPos = chapterStartPos + length;
    const blob = testamentBlob.slice(bookStartPos, chapterEndPos);

    const finalBlob = this.decompressBlob(blob);
    // console.log(Buffer.from(finalBlob).toString());

    const introText = this.getChapterIntro(finalBlob, startPos, positions, chapter, encoding);
    const renderedVerses = [];

    // Extract XML from each verse
    verses.forEach((verse) => {
      const verseXML = this.getXMLforVerse(verse, startPos, positions, finalBlob, encoding);
      renderedVerses.push({ xml: verseXML, verseNum: verse.verse });
    });

    return {
      intro: introText,
      verses: renderedVerses,
    };
  }

  static getXMLforVerse(verse, startPos, positions, blob, encoding) {
    const verseStart = startPos + positions[verse.chapter - 1].verses[verse.verse - 1].startPos;
    const verseEnd = verseStart + positions[verse.chapter - 1].verses[verse.verse - 1].length;
    return this.blobToString(blob.slice(verseStart, verseEnd), encoding);
  }

  static getChapterIntro(blob, startPos, positions, chapter, encoding) {
    let verseStart = 0;
    const verseEnd = startPos;
    if (chapter !== 1) {
      verseStart = positions[chapter - 2].startPos + positions[chapter - 2].length;
    }
    const introBlob = blob.slice(verseStart, verseEnd);
    const introText = this.blobToString(introBlob, encoding);
    return { text: introText, verseNum: 0 };
  }

  static blobToString(blob, encoding) {
    return Buffer.from(blob).toString(encoding);
  }

  static decompressBlob(blob) {
    const inflator = new pako.Inflate();
    const array = new Uint8Array(blob);
    inflator.push(array, true);
    if (inflator.err) {
      throw new Error(inflator.err);
    }
    const decompressedBlob = inflator.result;
    return decompressedBlob;
  }
}

module.exports = BlobReader;
