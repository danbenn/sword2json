import 'reflect-metadata';
import { createConnection, ConnectionOptions, Connection, getManager, Raw, Between } from 'typeorm';

import { BOOK_DATA } from './data/bibleMeta';
import {
    ENTITIES,
    BibleVersion,
    BiblePhrase,
    BibleBook,
    BibleSection,
    IBibleReferenceRangeVersion,
    IBibleReferenceRangeNormalized,
    IBibleReferenceNormalized,
    IBibleReferenceVersion
} from './models';
import { parsePhraseId, generateNormalizedRefId } from './utils';

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
        return await getManager().save(book);
    }

    async addParagraph(phrases: BiblePhrase[]) {
        await this.dbReady;
        const newPhrases = await this.addPhrases(phrases);
        const section = new BibleSection({
            phraseStartId: newPhrases[0].id!,
            phraseEndId: newPhrases[newPhrases.length - 1].id!,
            level: 0
        });
        return getManager().save(section);
    }

    async addPhrase(phrase: BiblePhrase) {
        await this.dbReady;
        await this.preparePhraseForDb(phrase);
        return await getManager().save(phrase);
    }

    async addPhrases(phrases: BiblePhrase[]) {
        let verse,
            phraseNum = 0;
        for (const phrase of phrases) {
            await this.normalizePhrase(phrase);
            if (!verse || verse != phrase.normalizedVerseNum) {
                verse = phrase.normalizedVerseNum;
                phraseNum = await this.getNextPhraseIdForNormalizedVerseNum(
                    phrase,
                    phrase.versionId
                );
            } else {
                phraseNum++;
            }
            phrase.phraseNum = phraseNum;
        }

        return getManager().save(phrases);
    }

    async addSection(section: BibleSection) {
        await this.dbReady;
        return await getManager().save(section);
    }

    addVersion(version: BibleVersion) {
        return getManager().save(version);
    }

    async generateMetadata(versionId: string) {
        versionId;
    }

    getBookForVersionReference(reference: IBibleReferenceVersion) {
        return getManager().findOne(BibleBook, {
            where: {
                versionId: reference.versionId,
                osisId: reference.bookOsisId
            }
        });
    }

    getBooksForVersion(versionId: number) {
        return getManager().find(BibleBook, {
            where: {
                versionId
            },
            order: {
                number: 'ASC'
            }
        });
    }

    async getNextPhraseIdForNormalizedVerseNum(
        reference: IBibleReferenceNormalized,
        versionId: number
    ): Promise<number> {
        await this.dbReady;
        const lastPhrase = await getManager().find(BiblePhrase, {
            where: {
                id: Between(
                    generateNormalizedRefId({ ...reference, versionId }, true),
                    generateNormalizedRefId(
                        {
                            ...reference,
                            versionId,
                            phraseNum: 99
                        },
                        true
                    )
                )
            },
            order: {
                id: 'DESC'
            },
            take: 1,
            select: ['id']
        });
        return lastPhrase.length ? parsePhraseId(lastPhrase[0].id).phraseNum! + 1 : 1;
    }
    getNextPhraseIdForVersionVerseNum(reference: Required<IBibleReferenceVersion>) {
        const nRef = this.getNormalizedV11n(reference);
        return this.getNextPhraseIdForNormalizedVerseNum(nRef, reference.versionId);
    }

    getNormalizedReference(reference: IBibleReferenceRangeVersion): IBibleReferenceRangeNormalized {
        // setting all missing properties on reference
        if (!reference.versionChapterEndNum)
            reference.versionChapterEndNum =
                reference.versionChapterNum || BOOK_DATA[reference.bookOsisId].chapters.length;
        if (!reference.versionChapterNum) reference.versionChapterNum = 1;
        if (!reference.versionVerseNum) reference.versionVerseNum = 1;
        if (!reference.versionVerseEndNum)
            reference.versionVerseEndNum =
                BOOK_DATA[reference.bookOsisId].chapters[reference.versionChapterEndNum - 1];

        // casting to required type since we are sure that every property is set now
        type reqRef = Required<IBibleReferenceRangeVersion>;
        const { normalizedChapterNum, normalizedVerseNum } = this.getNormalizedV11n(<reqRef>(
            reference
        ));
        const {
            normalizedChapterNum: normalizedChapterEndNum,
            normalizedVerseNum: normalizedVerseEndNum
        } = this.getNormalizedV11n({
            versionId: reference.versionId,
            bookOsisId: reference.bookOsisId,
            versionChapterNum: reference.versionChapterEndNum,
            versionVerseNum: reference.versionVerseEndNum
        });

        return {
            bookOsisId: reference.bookOsisId,
            normalizedChapterNum,
            normalizedVerseNum,
            normalizedChapterEndNum,
            normalizedVerseEndNum
        };
    }

    getNormalizedV11n(
        reference: Required<IBibleReferenceVersion>
    ): Required<IBibleReferenceNormalized> {
        // TODO: normalize this using the v11n-normalisation data from STEPData
        return {
            bookOsisId: reference.bookOsisId,
            normalizedChapterNum: reference.versionChapterNum,
            normalizedVerseNum: reference.versionVerseNum
        };
    }

    async getPhrases(reference: IBibleReferenceRangeVersion) {
        await this.dbReady;
        const nRef = this.getNormalizedReference(reference);
        return getManager().find(BiblePhrase, {
            where: {
                id: Raw(
                    col =>
                        `${col} BETWEEN '${generateNormalizedRefId(
                            nRef
                        )}' AND '${generateNormalizedRefId(
                            {
                                bookOsisId: nRef.bookOsisId,
                                normalizedChapterNum: nRef.normalizedChapterEndNum,
                                normalizedVerseNum: nRef.normalizedVerseEndNum
                            },
                            true
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

    async normalizePhrase(phrase: BiblePhrase) {
        if (!phrase.normalizedChapterNum) {
            const nV11n = this.getNormalizedV11n(phrase);
            phrase.normalizedChapterNum = nV11n.normalizedChapterNum;
            phrase.normalizedVerseNum = nV11n.normalizedVerseNum;
        }
    }

    async preparePhraseForDb(phrase: BiblePhrase) {
        if (
            !phrase.bookOsisId ||
            !phrase.versionChapterNum ||
            !phrase.versionVerseNum ||
            !phrase.versionId
        )
            throw `can't phrase phrase: reference missing or not complete`;

        if (!phrase.normalizedChapterNum) {
            await this.normalizePhrase(phrase);
        }

        if (!phrase.phraseNum) {
            phrase.phraseNum = await this.getNextPhraseIdForNormalizedVerseNum(
                phrase,
                phrase.versionId
            );
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
