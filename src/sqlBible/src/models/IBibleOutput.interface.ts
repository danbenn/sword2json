import {
    BiblePhrase,
    BibleSection,
    IBibleReferenceRangeVersion,
    IBibleReferenceRangeNormalized,
    BibleBook,
    BibleVersion,
    IBibleReferenceVersion,
    IBibleReferenceNormalized
} from '.';

export interface IBibleTextBase {
    version: BibleVersion;
    versionBook: BibleBook;
    rangeVersion: IBibleReferenceRangeVersion;
    rangeNormalized: IBibleReferenceRangeNormalized;
    sectionLevel1?: BibleSection;
    sectionLevel2Up?: BibleSection[];
}

export interface IBibleTextPlain extends IBibleTextBase {
    verses: IBibleVerse[];
}

export interface IBibleTextFormatted extends IBibleTextBase {
    paragraphs: IBibleTextFormattingGroup[];
}

export interface IBibleVerse {
    referenceVersion: Required<IBibleReferenceVersion>;
    referenceNormalized: Required<IBibleReferenceNormalized>;
    phrases: BiblePhrase[];
}

export interface IBibleTextFormattingGroup {
    type: 'none' | 'paragraph' | 'indent' | 'quote' | 'bold' | 'italic';
    content: IBibleTextFormattingGroup[] | BiblePhrase[];
}
