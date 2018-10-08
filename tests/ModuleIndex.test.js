const {
  SwordModule,
  ModuleIndex
} = require('../index');
const fs = require('fs');

test('JSON serialization', () => {
  const filename = './data/ESV2011.zip';
  const contents = fs.readFileSync(filename);
  const fileIndex = ModuleIndex.fromNodeBuffer(contents);
  const swordModule = new SwordModule(fileIndex);
  const json = fileIndex.serializeAsJson();
  const jsonString = JSON.stringify(json);
  const jsonObject = JSON.parse(jsonString);
  const restoredFileIndex = ModuleIndex.fromSerializedJson(jsonObject);
  expect(JSON.stringify(fileIndex)).toBe(JSON.stringify(restoredFileIndex));
});
