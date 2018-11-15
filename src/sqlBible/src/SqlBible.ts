import 'reflect-metadata';
import { createConnection, ConnectionOptions, Connection, getManager, Raw } from 'typeorm';

import { BOOK_DATA } from './data/bibleMeta';
import {
    ENTITIES,
    BibleVersion,
    BiblePhrase,
    BibleBook,
    IBibleReference,
    BibleSection
} from './models';
import { IBibleReferenceNormalized } from './models/IBibleReference.interface';
import { generatePhraseId } from './utils';

export class SqlBible {
    dbReady: Promise<Connection>;
    currentVersion?: BibleVersion;
    currentVersionMetadata?: BibleBook[];

    constructor(dbConfig: ConnectionOptions) {
        this.dbReady = createConnection({
            ...dbConfig,
            entities: ENTITIES,
            synchronize: true,
            logging: ['error']
        });
    }

    async addBook(book: BibleBook) {
        await this.dbReady;
        const newBook = await getManager().save(book);
        return newBook.id;
    }

    async addParagraph(phrases: BiblePhrase[]) {
        await this.dbReady;
        let verse,
            phraseNum = 0;
        for (const phrase of phrases) {
            if (!verse || verse != phrase.versionVerseNum) {
                verse = phrase.versionVerseNum;
                phraseNum = 1;
            } else {
                phraseNum++;
            }
            this.normalizePhrase(phrase);
            phrase.phraseNum = phraseNum;
        }
        const newPhrases = await getManager().save(phrases);
        const section = new BibleSection({
            phraseStartId: newPhrases[0].id!,
            phraseEndId: newPhrases[newPhrases.length - 1].id!,
            level: 0
        });
        return getManager().save(section);
    }

    async addPhrase(phrase: BiblePhrase, phraseNum: number) {
        if (!phrase.normalizedChapterNum) {
            const nV11n = this.getNormalizedV11n(
                phrase.versionId,
                phrase.versionChapterNum,
                phrase.versionVerseNum
            );
            phrase.normalizedChapterNum = nV11n.chapterNum;
            phrase.normalizedVerseNum = nV11n.verseNum;
        }
        phrase.phraseNum = phraseNum;
        return await getManager().save(phrase);
    }

    async addSection(section: BibleSection) {
        await this.dbReady;
        return await getManager().save(section);
    }

    async addVerse(phrases: BiblePhrase[]) {
        await this.dbReady;
        for (let i = 0; i < phrases.length; i++) {
            const phrase = phrases[i];
            this.normalizePhrase(phrase);
        }
        return getManager().save(phrases);
    }

    async addVersion(version: BibleVersion) {
        const newVersion = await getManager().save(version);
        return newVersion.id;
    }

    async generateMetadata(versionId: string) {
        versionId;
    }

    getNormalizedReference(reference: IBibleReference): IBibleReferenceNormalized {
        if (!reference.verseNum) reference.verseNum = 1;
        if (!reference.chapterEndNum) reference.chapterEndNum = reference.chapterNum;
        if (!reference.verseEndNum)
            reference.verseEndNum =
                BOOK_DATA[reference.bookOsisId].chapters[reference.chapterEndNum + 1];

        const { chapterNum, verseNum } = this.getNormalizedV11n(
            reference.versionId,
            reference.chapterNum,
            reference.verseNum
        );
        const { chapterNum: chapterEndNum, verseNum: verseEndNum } = this.getNormalizedV11n(
            reference.versionId,
            reference.chapterEndNum,
            reference.verseEndNum
        );

        return {
            bookOsisId: reference.bookOsisId,
            chapterNum,
            verseNum,
            chapterEndNum,
            verseEndNum
        };
    }

    getNormalizedV11n(versionId: number, chapterNum: number, verseNum: number) {
        // TODO: normalize this using the v11n-normalisation data from STEPData
        versionId;
        return {
            chapterNum,
            verseNum
        };
    }

    async getVerses(reference: IBibleReference) {
        await this.dbReady;
        const nRef = this.getNormalizedReference(reference);
        return getManager().find(BiblePhrase, {
            where: {
                id: Raw(
                    col =>
                        `${col} BETWEEN '${generatePhraseId(
                            nRef.bookOsisId,
                            nRef.chapterNum,
                            nRef.verseNum
                        )}' AND '${generatePhraseId(
                            nRef.bookOsisId,
                            nRef.chapterEndNum,
                            nRef.verseEndNum
                        )}' AND cast(${col} % 100000000000 / 100000000 as int) = ${
                            reference.versionId
                        }`
                )
            },

            order: {
                id: 'ASC'
            },
            relations: ['notes', 'crossReferences']
        });
    }

    normalizePhrase(phrase: BiblePhrase) {
        if (!phrase.normalizedChapterNum) {
            const nV11n = this.getNormalizedV11n(
                phrase.versionId,
                phrase.versionChapterNum,
                phrase.versionVerseNum
            );
            phrase.normalizedChapterNum = nV11n.chapterNum;
            phrase.normalizedVerseNum = nV11n.verseNum;
        }
    }

    async setVersion(version: string) {
        await this.dbReady;

        const versionDb = await getManager().findOne(BibleVersion, {
            version
        });
        this.currentVersion = versionDb;
    }
}
