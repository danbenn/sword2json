import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class BibleBook {
    @PrimaryGeneratedColumn()
    id: string;

    @Column()
    osisId: string;

    @Column()
    number: number;

    @Column()
    title: string;

    @Column()
    chaptersMetaJson: string;

    constructor(initializer: BibleBook) {
        if (initializer) Object.assign(this, initializer);
    }

    getChapterVerseCount(chapterNumber: number) {
        const chaptersMeta = JSON.parse(this.chaptersMetaJson);
        return chaptersMeta[chapterNumber - 1];
    }
}
