import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, Index } from 'typeorm';
import { BiblePhrase } from './BiblePhrase.entity';
// import { BibleNotePhrase } from './BibleNotePhrase';
import { BibleSection } from './BibleSection.entity';

@Entity()
export class BibleCrossReference {
    @PrimaryGeneratedColumn()
    id?: number;

    @Column()
    bookOsisId: string;

    @Column()
    chapterNum: number;

    @Column({ nullable: true })
    verseNum?: number;

    @Column({ nullable: true })
    chapterEndNum?: number;

    @Column({ nullable: true })
    verseEndNum?: number;

    @Column({
        nullable: true
    })
    @Index()
    phraseId?: string;

    @ManyToOne(() => BiblePhrase, phrase => phrase.crossReferences)
    phrase?: BiblePhrase;

    // @ManyToOne(() => BibleNotePhrase, notePhrase => notePhrase.crossReferences)
    // notePhrase?: BibleNotePhrase;

    @Column({ nullable: true })
    @Index()
    sectionId?: number;

    @ManyToOne(() => BibleSection, section => section.crossReferences)
    section?: BibleSection;

    constructor(initializer: BibleCrossReference) {
        if (initializer) Object.assign(this, initializer);
    }
}
