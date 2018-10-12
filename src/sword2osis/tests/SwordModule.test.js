const {
  SwordModule,
  ModuleIndex,
} = require('../src/index');
const fs = require('fs');
const path = require('path');

test('JSON formatting is correct for Psalms', () => {
  const swordModulePath = path.resolve(__dirname, '../data/ESV2011.zip');
  const swordModuleContents = fs.readFileSync(swordModulePath);
  const fileIndex = ModuleIndex.fromNodeBuffer(swordModuleContents);
  const swordModule = new SwordModule(fileIndex);
  const resultXML = swordModule.getChapterXML('Psa 1');

  const testFilePath = path.resolve(__dirname, './psalmsChapterXML.json');
  const expectedXML = JSON.parse(fs.readFileSync(testFilePath));
  expect(resultXML).toEqual(expectedXML);
});
