const fs = require('fs');
const path = require('path');
const osis2sqlite = require('../src/osis2sqlite').default;

test('Sqlite formatting is correct for Psalms', () => {
  const xmlPath = path.resolve(__dirname, './psalmsTestXML.json');
  const jsonPath = path.resolve(__dirname, './psalmsTestJSON.json');
  const psalmsChapterXML = JSON.parse(fs.readFileSync(xmlPath));
  const psalmsExpectedJson = JSON.parse(fs.readFileSync(jsonPath));

  psalmsChapterXML.forEach((verseXML, index) => {
    const psalmsResultJson = osis2sqlite(verseXML);
    expect(JSON.stringify(psalmsResultJson)).toEqual(JSON.stringify(psalmsExpectedJson[index]));
  });

});
