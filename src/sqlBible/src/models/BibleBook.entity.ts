import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity()
export class BibleBook {
    @PrimaryColumn()
    versionId: number;

    @PrimaryColumn()
    osisId: string;

    @Column()
    number: number;

    @Column()
    title: string;

    @Column()
    type: 'ot' | 'nt' | 'ap';

    @Column()
    chaptersMetaJson: string;

    constructor(initializer: Partial<BibleBook>) {
        if (initializer) Object.assign(this, initializer);
    }

    getChapterVerseCount(chapterNumber: number) {
        const chaptersMeta = JSON.parse(this.chaptersMetaJson);
        return chaptersMeta[chapterNumber - 1];
    }

    setChaptersMeta(chaptersCount: number[]) {
        this.chaptersMetaJson = JSON.stringify(chaptersCount);
    }
}
