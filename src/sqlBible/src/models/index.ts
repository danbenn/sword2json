import { BibleVersion } from './BibleVersion.entity';
import { BibleBook } from './BibleBook.entity';
import { IBibleVerse } from './IBibleVerse.interface';
import { BibleSection } from './BibleSection.entity';
import { BiblePhrase } from './BiblePhrase.entity';
import { BiblePhraseOriginalWord } from './BiblePhraseOriginalWord.entity';
import { IBibleReference } from './IBibleReference.interface';
import { BibleCrossReference } from './BibleCrossReference.entity';
import { BibleNote } from './BibleNote.entity';
import { IBibleNotePhrase } from './IBibleNotePhrase.interface';
import { Strong } from './Strong';

export {
    BibleVersion,
    BibleBook,
    IBibleVerse,
    BibleSection,
    BiblePhrase,
    BiblePhraseOriginalWord,
    IBibleReference,
    BibleCrossReference,
    BibleNote,
    IBibleNotePhrase,
    Strong
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
