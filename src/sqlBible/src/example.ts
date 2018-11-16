const wordGen = require('random-words');

import { SqlBible } from './SqlBible';
import { BiblePhrase, BibleNote, BibleBook } from './models';
import { getOsisIdFromBookGenericId } from './data/bibleMeta';

// function getRandomChar() {
//     var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'; //abcdefghijklmnopqrstuvwxyz0123456789

//     return possible.charAt(Math.floor(Math.random() * possible.length));
// }
const sqlBible = new SqlBible({
    type: 'sqlite',
    database: 'bible.db'
});

export const genDb = async () => {
    for (let bookNum = 1; bookNum <= 2; bookNum++) {
        const book = await sqlBible.addBook(
            new BibleBook({
                versionId: 1,
                number: bookNum,
                osisId: getOsisIdFromBookGenericId(bookNum),
                title: wordGen({ min: 1, max: 3, join: ' ' }),
                type: bookNum < 40 ? 'ot' : 'nt',
                chaptersMetaJson: JSON.stringify({})
            })
        );
        for (let chapter = 1; chapter <= 15; chapter++) {
            for (let paragraph = 0; paragraph < 5; paragraph++) {
                console.log(
                    'adding book ' +
                        bookNum +
                        ' and chapter ' +
                        chapter +
                        ' and paragraph ' +
                        (paragraph + 1)
                );

                let phrases = [];
                for (let verse = paragraph * 5 + 1; verse <= (paragraph + 1) * 5; verse++) {
                    for (let phraseIdx = 1; phraseIdx <= 22; phraseIdx++) {
                        let notes;
                        if (verse % 7 === 0 && phraseIdx === 1) {
                            const note = new BibleNote();
                            note.setPhrases([
                                {
                                    text: wordGen({ min: 1, max: 30, join: ' ' })
                                }
                            ]);
                            notes = [note];
                        }
                        const phrase = new BiblePhrase({
                            bookOsisId: getOsisIdFromBookGenericId(bookNum),
                            versionChapterNum: chapter,
                            versionVerseNum: verse,
                            versionId: 1,
                            text: wordGen({ min: 1, max: 2, join: ' ' }),
                            notes,
                            bold: true,
                            italic: false,
                            indentLevel: 0,
                            quoteLevel: 0,
                            strong: 'G' + phraseIdx * verse,
                            crossReferences:
                                verse % 5 === 0 && phraseIdx === 1
                                    ? [
                                          await sqlBible.createCrossReference({
                                              versionId: 1,
                                              bookOsisId: 'Gen',
                                              versionChapterNum: 1
                                          })
                                      ]
                                    : undefined
                        });
                        phrases.push(phrase);
                    }
                }
                await sqlBible.addParagraph(phrases);
            }
        }
        await sqlBible.generateBookMetadata(book);
    }
};

export const getData = async () => {
    const section = await sqlBible.getPhrases({
        versionId: 1,
        bookOsisId: 'Gen',
        versionChapterNum: 1,
        versionVerseNum: 3
    });
    console.log(section);
};

const run = async () => {
    await genDb();
    getData();
};

run();
