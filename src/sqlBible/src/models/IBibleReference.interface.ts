export interface IBibleReference {
    versionId: number;
    bookOsisId: string;
    chapterNum: number;
    verseNum?: number;
    chapterEndNum?: number;
    verseEndNum?: number;
}

export interface IBibleReferenceNormalized {
    bookOsisId: string;
    chapterNum: number;
    verseNum: number;
    chapterEndNum: number;
    verseEndNum: number;
}
