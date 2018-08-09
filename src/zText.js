

const FileReader = require('filereader');
const Blob = require('blob');
const async = require('async');
const pako = require('pako');

let zlibReader = new FileReader(),
  textReader = new FileReader();


function getRawEntry(inBlob, inPos, inVList, inEcoding, inIntro) {
  if (!inPos[inVList[0].chapter - 1]) {
    throw new Error(`can\'t find chapter ${inVList[0].chapter} in this module`);
  }

  let bookStartPos = inPos[inVList[0].chapter - 1].bookStartPos,
    startPos = inPos[inVList[0].chapter - 1].startPos,
    length = inPos[inVList[0].chapter - 1].length,
    chapterStartPos = bookStartPos + startPos,
    chapterEndPos = chapterStartPos + length,
    blob = inBlob.slice(bookStartPos, chapterEndPos);

    // Return Intro (=Book.Chapter.0) only, if vList.length > 1 or verseNumber === 1
  if (inVList.length === 1 && inVList[0].verse !== 1) {
    inIntro = false;
  }

  const inflator = new pako.Inflate();
  const view = new Uint8Array(blob);

  inflator.push(view, true);
  if (inflator.err) {
    inCallback(inflator.err);
    throw new Error(inflator.err);
  }

  // console.log(inflator.result);
  const infBlob = inflator.result;
  console.log(Buffer.from(infBlob).toString());
  return;
  // Read raw text entry
  let rawText = [],
    verseStart = 0,
    verseEnd = 0,
    z = 0,
    gotIntro = false;
  async.whilst(
    () => z < inVList.length,
    (cb) => {
      if (inIntro && !gotIntro) {
        verseStart = (inVList[z].chapter === 1) ? 0 : inPos[inVList[z].chapter - 2].startPos + inPos[inVList[z].chapter - 2].length;
        verseEnd = startPos;
      } else {
        verseStart = startPos + inPos[inVList[z].chapter - 1].verses[inVList[z].verse - 1].startPos;
        verseEnd = verseStart + inPos[inVList[z].chapter - 1].verses[inVList[z].verse - 1].length;
      }
      if (!inEcoding) { textReader.readAsText(infBlob.slice(verseStart, verseEnd), 'CP1252'); } else { textReader.readAsText(infBlob.slice(verseStart, verseEnd), inEcoding); }
      textReader.onload = function (e) {
        if (inIntro && !gotIntro) {
          if (e.target.result !== '') { rawText.push({ text: e.target.result, osisRef: `${inVList[z].book}.${inVList[z].chapter}.0`, verse: 0 }); }
          gotIntro = true;
        } else {
          rawText.push({ text: e.target.result, osisRef: inVList[z].osisRef, verse: inVList[z].verse });
          z++;
        }
        cb();
      };
    },
    (inError) => {
      // console.log(rawText);
      inCallback(inError, rawText);
    },
  );
}

const zText = {
  getRawEntry,
};

module.exports = zText;
