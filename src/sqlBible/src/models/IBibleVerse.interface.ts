import { BiblePhrase } from './BiblePhrase.entity';

export interface IBibleVerse {
    versionId: string;
    bookOsisId: string;
    chapterNum: number;
    verseNum: number;
    phrases: BiblePhrase[];
}
