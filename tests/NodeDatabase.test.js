const {
  SwordModule,
  ModuleIndex,
  NodeDatabase,
  VerseMetadata,
} = require('../index');
const fs = require('fs');

test('Database loading and retrieval of chapters', async () => {
  const filename = './data/ESV2011.zip';
  const contents = fs.readFileSync(filename);
  const fileIndex = ModuleIndex.fromNodeBuffer(contents);
  const swordModule = new SwordModule(fileIndex);
  const database = new NodeDatabase();
  await database.open(':memory:');
  await database.createVerseTable();
  await database.store(swordModule);
  const verseRange = 'Psa 1';
  const { book, chapter, verse } = VerseMetadata.parseVkey(verseRange);
  const version = swordModule.config.moduleName;
  const chapterJson = await database.getChapterJson(book, chapter, version);
  const psalmsChapter1 = JSON.parse(fs.readFileSync('./tests/psalmsTestData.json'));
  expect(JSON.stringify(chapterJson)).toBe(JSON.stringify(psalmsChapter1));
}, 15000);