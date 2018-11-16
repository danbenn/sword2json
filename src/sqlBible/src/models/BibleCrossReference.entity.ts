import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, Index } from 'typeorm';
import { BiblePhrase } from './BiblePhrase.entity';
import { BibleSection } from './BibleSection.entity';

@Entity()
export class BibleCrossReference {
    @PrimaryGeneratedColumn()
    id?: number;

    @Column()
    normalizedRefId: number;

    @Column({ nullable: true })
    normalizedRefIdEnd?: number;

    @Column()
    versionChapterNum: number;

    @Column({ nullable: true })
    versionVerseNum?: number;

    @Column({ nullable: true })
    versionChapterEndNum?: number;

    @Column({ nullable: true })
    versionVerseEndNum?: number;

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

    constructor(initializer: BibleCrossReference) {
        if (initializer) Object.assign(this, initializer);
    }
}
