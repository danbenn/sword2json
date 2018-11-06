import { BiblePhrase } from './entities/BiblePhrase';

export interface BibleReference {
    bookOsisId: string;
    chapterNum: number;
    verseNum?: number;
}

export interface BibleSection {
    versionId: string;
    refStart: BibleReference;
    refEnd?: BibleReference;
}

export interface BibleVersion {
    id: string;
    books: BibleBook[];
}

export interface BibleBook {
    osisId: string;
    chapters: BibleChapter[];
}

export interface BibleChapter {
    verses: BibleVerse[];
}

export interface BibleVerse {
    phrases: BiblePhrase[];
}
