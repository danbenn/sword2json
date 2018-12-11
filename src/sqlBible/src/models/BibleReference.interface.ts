export interface IBibleReferenceBase {
    bookOsisId: string;
    normalizedChapterNum?: number;
    normalizedVerseNum?: number;
    versionId?: number;
}

export interface IBiblePhraseRef extends IBibleReferenceBase {
    phraseNum?: number;
    isNormalized: true;
}

export interface IBibleReference extends IBibleReferenceBase {
    isNormalized?: boolean;
    versionChapterNum?: number;
    versionVerseNum?: number;
}

export interface IBibleReferenceNormalized extends IBibleReference {
    isNormalized: true;
}

export interface IBibleReferenceRange extends IBibleReference {
    normalizedChapterEndNum?: number;
    normalizedVerseEndNum?: number;
    versionChapterEndNum?: number;
    versionVerseEndNum?: number;
}

export interface IBibleReferenceRangeNormalized extends IBibleReferenceRange {
    isNormalized: true;
}
