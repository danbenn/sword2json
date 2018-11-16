import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    ManyToOne,
    Index,
    AfterLoad,
    BeforeInsert
} from 'typeorm';
import { parsePhraseId, generateNormalizedRefId } from '../utils';
import {
    BiblePhrase,
    BibleSection,
    IBibleReferenceRangeVersion,
    IBibleReferenceRangeNormalized
} from '.';

@Entity()
export class BibleCrossReference
    implements IBibleReferenceRangeVersion, IBibleReferenceRangeNormalized {
    @PrimaryGeneratedColumn()
    id?: number;

    @Column()
    normalizedRefId: number;

    @Column({ nullable: true })
    normalizedRefIdEnd?: number;

    // the normalizedRefIds encode the following attributes:
    bookOsisId: string;
    normalizedChapterNum?: number;
    normalizedChapterEndNum?: number;
    normalizedVerseNum?: number;
    normalizedVerseEndNum?: number;

    @Column({ nullable: true })
    versionChapterNum?: number;

    @Column({ nullable: true })
    versionVerseNum?: number;

    @Column({ nullable: true })
    versionChapterEndNum?: number;

    @Column({ nullable: true })
    versionVerseEndNum?: number;

    // this can be inferred from phraseId
    versionId: number;

    @Column({ nullable: true })
    text?: string;

    @Column({
        nullable: true
    })
    @Index()
    phraseId?: number;

    @ManyToOne(() => BiblePhrase, phrase => phrase.crossReferences)
    phrase?: BiblePhrase;

    @Column({ nullable: true })
    @Index()
    sectionId?: number;

    @ManyToOne(() => BibleSection, section => section.crossReferences)
    section?: BibleSection;

    constructor(initializer: Partial<BibleCrossReference>) {
        if (initializer) Object.assign(this, initializer);
    }

    @AfterLoad()
    parseId() {
        if (this.phraseId) {
            const phraseRef = parsePhraseId(this.phraseId);
            // a phraseId has versionId encoded
            this.versionId = phraseRef.versionId!;
        }

        // since we got this from the DB we know we have an id and we know it has all the data
        const normalizedRef = parsePhraseId(this.normalizedRefId!);
        this.bookOsisId = normalizedRef.bookOsisId;
        this.normalizedChapterNum = normalizedRef.normalizedChapterNum!;
        this.normalizedVerseNum = normalizedRef.normalizedVerseNum!;

        if (this.normalizedRefIdEnd) {
            const normalizedRefEnd = parsePhraseId(this.normalizedRefIdEnd);
            this.normalizedChapterEndNum = normalizedRefEnd.normalizedChapterNum;
            this.normalizedVerseEndNum = normalizedRefEnd.normalizedVerseNum;
        }
    }

    @BeforeInsert()
    async prepare() {
        if (
            !this.bookOsisId ||
            (this.versionChapterNum && !this.normalizedChapterNum) ||
            (this.versionVerseNum && !this.normalizedVerseNum) ||
            (this.versionChapterEndNum && !this.normalizedChapterEndNum) ||
            (this.versionVerseEndNum && !this.normalizedVerseEndNum)
        )
            throw `can't generate references: missing reference information. please use ` +
                `SqlBible::createCrossReference to create the object`;

        this.normalizedRefId = generateNormalizedRefId(this, 3);
        if (this.versionChapterEndNum || this.versionVerseEndNum)
            this.normalizedRefIdEnd = generateNormalizedRefId(
                {
                    bookOsisId: this.bookOsisId,
                    normalizedChapterNum: this.normalizedChapterEndNum,
                    normalizedVerseNum: this.normalizedVerseEndNum
                },
                3
            );
    }
}
