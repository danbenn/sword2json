import { BibleVersion } from './BibleVersion.entity';
import { BibleBook } from './BibleBook.entity';
import { BibleSection } from './BibleSection.entity';
import { BiblePhrase } from './BiblePhrase.entity';
import { BiblePhraseOriginalWord } from './BiblePhraseOriginalWord.entity';
import { BibleCrossReference } from './BibleCrossReference.entity';
import { BibleNote } from './BibleNote.entity';
import { Strong } from './Strong';

import { IBibleVerse } from './IBibleVerse.interface';
import {
    IBibleReferenceVersion,
    IBibleReferenceRangeVersion,
    IBibleReferenceNormalized,
    IBibleReferenceRangeNormalized,
    IBiblePhraseRef
} from './IBibleReference.interface';
import { IBibleNotePhrase } from './IBibleNotePhrase.interface';

export {
    BibleVersion,
    BibleBook,
    BibleSection,
    BiblePhrase,
    BiblePhraseOriginalWord,
    BibleCrossReference,
    BibleNote,
    Strong,
    IBibleVerse,
    IBibleNotePhrase,
    IBibleReferenceVersion,
    IBibleReferenceRangeVersion,
    IBibleReferenceNormalized,
    IBibleReferenceRangeNormalized,
    IBiblePhraseRef
};
export const ENTITIES = [
    BibleVersion,
    BibleBook,
    BibleSection,
    BiblePhrase,
    BiblePhraseOriginalWord,
    BibleCrossReference,
    BibleNote,
    Strong
];
