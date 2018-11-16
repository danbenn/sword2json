import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, Index } from 'typeorm';
import { BiblePhrase } from './BiblePhrase.entity';
import { BibleSection } from './BibleSection.entity';
import { IBibleNotePhrase } from './IBibleNotePhrase.interface';

@Entity()
export class BibleNote {
    @PrimaryGeneratedColumn()
    id?: number;

    @Column({ nullable: true })
    key?: string;

    @Column({ nullable: true })
    type?: string;

    @Column()
    noteJson: string;

    @Column({ nullable: true })
    @Index()
    phraseId?: number;

    @ManyToOne(() => BiblePhrase, phrase => phrase.notes)
    phrase?: BiblePhrase;

    @Column({ nullable: true })
    @Index()
    sectionId?: number;
    @ManyToOne(() => BibleSection, section => section.notes)
    section?: BibleSection;

    constructor(initializer: Partial<BibleNote>) {
        if (initializer) Object.assign(this, initializer);
    }

    getPhrases = () => <IBibleNotePhrase[]>JSON.parse(this.noteJson);

    setPhrases = (phrases: IBibleNotePhrase[]) => (this.noteJson = JSON.stringify(phrases));
}
