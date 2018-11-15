import {
    Entity,
    Column,
    JoinColumn,
    OneToMany,
    PrimaryColumn,
    AfterLoad,
    BeforeInsert
} from 'typeorm';
import { BiblePhraseOriginalWord } from './BiblePhraseOriginalWord.entity';
import { BibleCrossReference } from './BibleCrossReference.entity';
import { BibleNote } from './BibleNote.entity';
import { generatePhraseId, parsePhraseId } from '../utils';
import { IBiblePhraseRef } from './IBiblePhraseRef.interface';

@Entity()
// @Index(['versionId', 'bookOsisId', 'versionChapterNum', 'versionVerseNum'])
export class BiblePhrase implements IBiblePhraseRef {
    @PrimaryColumn()
    id: string;

    // the id encodes the following attributes in that order:
    osisBookId: string;
    normalizedChapterNum?: number;
    normalizedVerseNum?: number;
    versionId: number;
    versionChapterNum: number;
    versionVerseNum: number;
    phraseNum?: number;

    @Column()
    text: string;

    @Column({ nullable: true })
    bold?: boolean;

    @Column({ nullable: true })
    italic?: boolean;

    @Column({ nullable: true })
    indentLevel?: number;

    @Column({ nullable: true })
    quoteLevel?: number;

    @Column({ nullable: true })
    strong: string;

    @OneToMany(() => BiblePhraseOriginalWord, originalWord => originalWord.phrase, {
        cascade: true
    })
    @JoinColumn()
    originalWords: BiblePhraseOriginalWord[];

    @OneToMany(() => BibleCrossReference, crossReference => crossReference.phrase, {
        cascade: true
    })
    @JoinColumn()
    crossReferences: BibleCrossReference[];

    @OneToMany(() => BibleNote, note => note.phrase, {
        cascade: true
    })
    @JoinColumn()
    notes: BibleNote[];

    constructor(initializer: Partial<BiblePhrase>) {
        if (initializer) Object.assign(this, initializer);
    }

    @BeforeInsert()
    generateId() {
        if (
            !this.osisBookId ||
            !this.normalizedChapterNum ||
            !this.normalizedVerseNum ||
            !this.versionId ||
            !this.versionChapterNum ||
            !this.versionVerseNum ||
            !this.phraseNum
        )
            throw "can't generate phrase ID: missing reference information";

        this.id = generatePhraseId(
            this.osisBookId,
            this.normalizedChapterNum,
            this.normalizedVerseNum,
            this.versionId,
            this.versionChapterNum,
            this.versionVerseNum,
            this.phraseNum
        );
    }

    @AfterLoad()
    parseId() {
        const phraseRef = parsePhraseId(this.id!);
        this.versionVerseNum = phraseRef.versionVerseNum;
        this.versionChapterNum = phraseRef.versionChapterNum;
        this.versionId = phraseRef.versionId;
        this.normalizedVerseNum = phraseRef.normalizedVerseNum;
        this.normalizedChapterNum = phraseRef.normalizedChapterNum;
        this.osisBookId = phraseRef.osisBookId;
    }
}
