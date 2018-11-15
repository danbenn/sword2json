export interface IBiblePhraseRef {
    osisBookId: string;
    normalizedChapterNum?: number;
    normalizedVerseNum?: number;
    versionId: number;
    versionChapterNum: number;
    versionVerseNum: number;
    phraseNum?: number;
}
