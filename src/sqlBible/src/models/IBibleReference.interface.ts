export interface IBibleReferenceBase {
    bookOsisId: string;
}

export interface IBibleReferenceNormalized extends IBibleReferenceBase {
    normalizedChapterNum?: number;
    normalizedVerseNum?: number;
}

export interface IBibleReferenceRangeNormalized extends IBibleReferenceNormalized {
    normalizedChapterEndNum?: number;
    normalizedVerseEndNum?: number;
}

export interface IBibleReferenceVersion extends IBibleReferenceBase {
    versionId: number;
    versionChapterNum?: number;
    versionVerseNum?: number;
}

export interface IBibleReferenceRangeVersion extends IBibleReferenceVersion {
    versionChapterEndNum?: number;
    versionVerseEndNum?: number;
}

export interface IBiblePhraseRef extends IBibleReferenceNormalized {
    bookOsisId: string;
    normalizedChapterNum?: number;
    normalizedVerseNum?: number;
    versionId?: number;
    phraseNum?: number;
}
