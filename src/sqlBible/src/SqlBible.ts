import 'reflect-metadata';
import { createConnection, ConnectionOptions, Raw, EntityManager } from 'typeorm';

import {
    ENTITIES,
    BibleVersion,
    BiblePhrase,
    BibleBook,
    BibleSection,
    IBibleReferenceRangeVersion,
    IBibleReferenceRangeNormalized,
    IBibleReferenceNormalized,
    IBibleReferenceVersion,
    BibleCrossReference
} from './models';
import { parsePhraseId, generatePhraseIdSql } from './utils';

export class SqlBible {
    currentVersion?: BibleVersion;
    currentVersionMetadata?: BibleBook[];
    pEntityManager: Promise<EntityManager>;

    constructor(dbConfig: ConnectionOptions) {
        this.pEntityManager = createConnection({
            ...dbConfig,
            entities: ENTITIES,
            synchronize: true,
            logging: ['error']
        }).then(conn => conn.manager);
    }

    async addBook(book: BibleBook) {
        const entityManager = await this.pEntityManager;
        return await entityManager.save(book);
    }

    async addParagraph(phrases: BiblePhrase[]) {
        const entityManager = await this.pEntityManager;
        const newPhrases = await this.addPhrases(phrases);
        const section = new BibleSection({
            phraseStartId: newPhrases[0].id!,
            phraseEndId: newPhrases[newPhrases.length - 1].id!,
            level: 0
        });
        return entityManager.save(section);
    }

    async addPhrase(phrase: BiblePhrase) {
        const entityManager = await this.pEntityManager;
        await this.preparePhraseForDb(phrase);
        return await entityManager.save(phrase);
    }

    async addPhrases(phrases: BiblePhrase[]) {
        const entityManager = await this.pEntityManager;
        let verse,
            phraseNum = 0;
        for (const phrase of phrases) {
            if (!phrase.normalizedChapterNum) {
                const {
                    normalizedChapterNum,
                    normalizedVerseNum
                } = await this.getNormalizedReference(phrase);
                phrase.normalizedChapterNum = normalizedChapterNum;
                phrase.normalizedVerseNum = normalizedVerseNum;
            }
            if (!verse || verse !== phrase.normalizedVerseNum) {
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

        return entityManager.save(phrases);
    }

    async addSection(section: BibleSection) {
        const entityManager = await this.pEntityManager;
        return await entityManager.save(section);
    }

    async addVersion(version: BibleVersion) {
        const entityManager = await this.pEntityManager;
        return entityManager.save(version);
    }

    async createCrossReference(refRange: IBibleReferenceRangeVersion) {
        return new BibleCrossReference(await this.getNormalizedReferenceRange(refRange));
    }

    async generateBookMetadata(book: BibleBook) {
        const entityManager = await this.pEntityManager;
        const metaData = await entityManager
            .createQueryBuilder(BiblePhrase, 'phrase')
            .addSelect('COUNT(DISTINCT phrase.versionVerseNum)', 'numVerses')
            .where({
                id: Raw(col =>
                    generatePhraseIdSql({ bookOsisId: book.osisId }, col, book.versionId)
                )
            })
            .orderBy('phrase.versionChapterNum')
            .groupBy('phrase.versionChapterNum')
            .getRawMany();
        book.chaptersCount = metaData.map(chapterMetaDb => chapterMetaDb.numVerses);
        return entityManager.save(book);
    }

    async getBookForVersionReference({ versionId, bookOsisId }: IBibleReferenceVersion) {
        const entityManager = await this.pEntityManager;
        return entityManager.findOne(BibleBook, {
            where: {
                versionId,
                osisId: bookOsisId
            }
        });
    }

    async getBooksForVersion(versionId: number) {
        const entityManager = await this.pEntityManager;
        return entityManager.find(BibleBook, {
            where: { versionId },
            order: { number: 'ASC' }
        });
    }

    async getNextPhraseIdForNormalizedVerseNum(
        reference: IBibleReferenceNormalized,
        versionId: number
    ): Promise<number> {
        const entityManager = await this.pEntityManager;
        const lastPhrase = await entityManager.find(BiblePhrase, {
            where: { id: Raw(col => generatePhraseIdSql(reference, col, versionId)) },
            order: { id: 'DESC' },
            take: 1,
            select: ['id']
        });
        return lastPhrase.length ? parsePhraseId(lastPhrase[0].id).phraseNum! + 1 : 1;
    }

    async getNextPhraseIdForVersionVerseNum(reference: Required<IBibleReferenceVersion>) {
        const nRef = await this.getNormalizedReference(reference);
        return this.getNextPhraseIdForNormalizedVerseNum(nRef, reference.versionId);
    }

    // we excpect this to be an async method in the future
    // - to not break code then we make it async already
    async getNormalizedReference(
        reference: Required<IBibleReferenceVersion>
    ): Promise<Required<IBibleReferenceNormalized>> {
        // TODO: normalize this using the v11n-normalisation data from STEPData
        return {
            bookOsisId: reference.bookOsisId,
            normalizedChapterNum: reference.versionChapterNum,
            normalizedVerseNum: reference.versionVerseNum
        };
    }

    async getNormalizedReferenceRange(
        reference: IBibleReferenceRangeVersion
    ): Promise<IBibleReferenceRangeNormalized> {
        const entityManager = await this.pEntityManager;
        const versionBook = await entityManager.findOne(BibleBook, {
            where: { versionId: reference.versionId, osisId: reference.bookOsisId }
        });
        if (!versionBook) {
            throw new Error(
                `can't get normalized reference: invalid or missing version or book data`
            );
        }

        // setting all missing properties on reference
        const versionChapterEndNum =
            reference.versionChapterEndNum ||
            reference.versionChapterNum ||
            versionBook.chaptersCount.length;
        const rangeWithFullReferences: Required<IBibleReferenceRangeVersion> = {
            versionId: reference.versionId,
            bookOsisId: reference.bookOsisId,
            versionChapterNum: reference.versionChapterNum || 1,
            versionChapterEndNum,
            versionVerseNum: reference.versionVerseNum || 1,
            versionVerseEndNum:
                reference.versionVerseEndNum ||
                versionBook.getChapterVerseCount(versionChapterEndNum)
        };
        const { normalizedChapterNum, normalizedVerseNum } = await this.getNormalizedReference(
            rangeWithFullReferences
        );
        const {
            normalizedChapterNum: normalizedChapterEndNum,
            normalizedVerseNum: normalizedVerseEndNum
        } = await this.getNormalizedReference({
            versionId: rangeWithFullReferences.versionId,
            bookOsisId: rangeWithFullReferences.bookOsisId,
            versionChapterNum: rangeWithFullReferences.versionChapterEndNum,
            versionVerseNum: rangeWithFullReferences.versionVerseEndNum
        });

        return {
            bookOsisId: reference.bookOsisId,
            normalizedChapterNum,
            normalizedVerseNum,
            normalizedChapterEndNum,
            normalizedVerseEndNum
        };
    }

    async getPhrases(range: IBibleReferenceRangeVersion) {
        const entityManager = await this.pEntityManager;
        const normalizedRange = await this.getNormalizedReferenceRange(range);
        return entityManager.find(BiblePhrase, {
            where: { id: Raw(col => generatePhraseIdSql(normalizedRange, col, range.versionId)) },
            order: { id: 'ASC' },
            relations: ['notes', 'crossReferences']
        });
    }

    async preparePhraseForDb(phrase: BiblePhrase) {
        if (
            !phrase.bookOsisId ||
            !phrase.versionChapterNum ||
            !phrase.versionVerseNum ||
            !phrase.versionId
        )
            throw new Error(`can't phrase phrase: reference missing or not complete`);

        if (!phrase.normalizedChapterNum) {
            const { normalizedChapterNum, normalizedVerseNum } = await this.getNormalizedReference(
                phrase
            );
            phrase.normalizedChapterNum = normalizedChapterNum;
            phrase.normalizedVerseNum = normalizedVerseNum;
        }

        if (!phrase.phraseNum) {
            phrase.phraseNum = await this.getNextPhraseIdForNormalizedVerseNum(
                phrase,
                phrase.versionId
            );
        }
    }

    async setVersion(version: string) {
        const entityManager = await this.pEntityManager;

        const versionDb = await entityManager.findOne(BibleVersion, { version });
        this.currentVersion = versionDb;
    }
}
