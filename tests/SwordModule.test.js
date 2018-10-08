const {
  SwordModule,
  ModuleIndex
} = require('../index');
const fs = require('fs');

test('JSON formatting is correct for Psalms', () => {
  const filename = './data/ESV2011.zip';
  const contents = fs.readFileSync(filename);
  const fileIndex = ModuleIndex.fromNodeBuffer(contents);
  const swordModule = new SwordModule(fileIndex);
	const jsonResult = swordModule.getJSON('Psa 1');
	const psalmsChapter1 = JSON.parse(fs.readFileSync('./tests/psalmsTestData.json'));
  expect(jsonResult).toEqual(psalmsChapter1);
});
