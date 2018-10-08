import SwordModule from './SwordModule';
import OsisParser from './OsisParser';
import * as types from './types';
const VerseMetadata = require('./VerseMetadata');
const sqlite = require('sqlite');

export default class NodeDatabase {
  database: any;

  async open(name: string) {
    this.database = await sqlite.open(name, { Promise });
  }

  async clear() {
    return this.database.run(
      'DROP TABLE IF EXISTS verses;',
    );
  }

  async createVerseTable() {
    return this.database.run(
      'CREATE TABLE IF NOT EXISTS verses (\
        book TEXT NOT NULL,\
        chapter INTEGER NOT NULL,\
        verse INTEGER NOT NULL,\
        version TEXT NOT NULL,\
        xml TEXT NOT NULL,\
        unique (book, chapter, verse, version)\
      );',
    );
  }

  async getVerseJson(book: string, chapter: number, verse: number, version: string) {
    const verseRow = await this.database.get(
      'SELECT * from verses WHERE book=? \
      AND chapter=? AND verse=? AND version=?',
      [book, chapter, verse, version],
    );
    return OsisParser.getJsonFromXML(verseRow.xml);
  }

  async getChapterJson(book: string, chapter: number, version: string) {
    const chapterRows = await this.database.all(
      'SELECT * from verses WHERE book=? \
      AND chapter=? AND version=?',
      [book, chapter, version],
    );
    const xmlOfVerses = chapterRows.map((row) => {
      const deObfuscatedText = Buffer.from(row.xml, 'base64').toString('ascii');
      const verseXML: types.VerseXML = { text: deObfuscatedText, verse: row.verse };
      return verseXML;
    });
    const chapterIntro = '';
    const chapterXML: types.ChapterXML = { intro: chapterIntro, verses: xmlOfVerses };

    return OsisParser.getJsonFromXML(chapterXML);
  }

  async store(swordModule: SwordModule) {
    let chapterOSIS: string = 'Gen.1';
    const version = swordModule.config.moduleName;
    const databaseInsertionPromises = [];
    while (chapterOSIS !== 'Rev.22') {
      const [book, chapterStr] = chapterOSIS.split('.');
      const chapter = Number(chapterStr);
      const chapterXML = swordModule.getXMLforChapter(chapterOSIS);
      const versePromises = chapterXML.verses.map(async ({ text, verse }) => {
        return this.insertVerse(book, chapter, verse, version, text);
      });
      databaseInsertionPromises.push(...versePromises);
      chapterOSIS = VerseMetadata.next(chapterOSIS).osisRef;
    }
    await Promise.all(databaseInsertionPromises);
  }

  insertVerse(book: string, chapter: number, verse: number,
              version: string, text: string) {
    const obfuscatedText = Buffer.from(text).toString('base64');
    return this.database.run(
      'INSERT INTO verses (book, chapter, verse, version, xml) \
        VALUES (?, ?, ?, ?, ?);',
      [book, chapter, verse, version, obfuscatedText],
    );
  }
}
