import {
  Book,
  BibleVersion,
  Phrase,
  PhraseMorphology,
  StrongsNumber,
  StrongsPhrase,
  Footnote,
  CrossReference,
  LineBreak,
  ParagraphBreak,
  Indentation,
} from '../src/types';
const fs = require('fs');
const path = require('path');

const osis2sqlite = require('../src/osis2sqlite').default;

test('Sqlite formatting is correct for Psalms', () => {
  const xmlPath = path.resolve(__dirname, './psalmsTestXML.json');
  const jsonPath = path.resolve(__dirname, './psalmsTestJSON.json');


  const psalmsChapterXML = JSON.parse(fs.readFileSync(xmlPath)).slice(0, 1);
  const psalmsExpectedJson = JSON.parse(fs.readFileSync(jsonPath));

  const newJsonPath = path.resolve(__dirname, './psalmsTestSchema.json');
  const newExpectedJson = JSON.parse(fs.readFileSync(newJsonPath));
  psalmsChapterXML.forEach((verseXML, index) => {
    const psalmsResultJson = osis2sqlite(verseXML);

    expect(psalmsResultJson).toEqual(newExpectedJson[index].content);
  });

});
