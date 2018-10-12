const {
  SwordModule,
  ModuleIndex
} = require('../src/index');
const fs = require('fs');
const path = require('path');

test('JSON serialization', () => {
  const swordModulePath = path.resolve(__dirname, '../data/ESV2011.zip');
  const swordModuleContents = fs.readFileSync(swordModulePath);
  const fileIndex = ModuleIndex.fromNodeBuffer(swordModuleContents);
  const swordModule = new SwordModule(fileIndex);
  const json = fileIndex.serializeAsJson();
  const jsonString = JSON.stringify(json);
  const jsonObject = JSON.parse(jsonString);
  const restoredFileIndex = ModuleIndex.fromSerializedJson(jsonObject);
  expect(JSON.stringify(fileIndex)).toBe(JSON.stringify(restoredFileIndex));
});
