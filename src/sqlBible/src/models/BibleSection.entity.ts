import { Entity, PrimaryGeneratedColumn, Column, OneToMany, JoinColumn, Index } from 'typeorm';
import { BibleNote } from './BibleNote.entity';
import { BibleCrossReference } from './BibleCrossReference.entity';

@Entity()
@Index(['phraseStartId', 'phraseEndId'])
export class BibleSection {
    @PrimaryGeneratedColumn()
    id?: number;

    @Column()
    level: number;

    @Column({})
    phraseStartId: string;

    @Column({})
    phraseEndId: string;

    @Column({ nullable: true })
    title?: string;

    @OneToMany(() => BibleNote, note => note.section, {
        cascade: true
    })
    @JoinColumn()
    notes?: BibleNote[];

    @OneToMany(() => BibleCrossReference, crossReference => crossReference.section, {
        cascade: true
    })
    @JoinColumn()
    crossReferences?: BibleCrossReference[];

    constructor(initializer: BibleSection) {
        if (initializer) Object.assign(this, initializer);
    }
}
