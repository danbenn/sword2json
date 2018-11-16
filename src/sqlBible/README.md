# sqlBible

## Usage

```typescript
// initialize SqlBible
import SqlBible from 'sql-bible';

const sqlBible = new SqlBible({
    type: 'sqlite',
    database: './bible.db'
});

/**
 * INPUT
 */

// if you haven't created a version yet, do
const esvVersionId = await sqlBible.addVersion(
    new BibleVersion({
        version: 'ESV',
        description: 'English Standard Bible',
        language: 'en-US'
    })
);

// ... and a bible book
const bookGenesis = await sqlBible.addBook(
    new BibleBook({
        versionId: esvVersionId,
        number: 1, // order of book in version
        osisId: 'Gen',
        title: 'Genesis',
        type: 'ot'
    })
);

// ideally, adding verses should be done paragraph by paragraph:
// a paragraph is a list of phrases:
const phrases: BiblePhrase[] = [];

// we add cross references directly to a phrase
// (we use a sqlBible-method here since normalized references need to be created)
const cRef = await sqlBible.createCrossReference({
    versionId: esvVersionId,
    bookOsisId: 'Gen',
    versionChapterNum: 1
});

// .. notes likewise
const note1 = new BibleNote();
note1.setPhrases([
    { text: 'this is' },
    { text: 'very', italic: true },
    { text: 'important', crossReferences: [cRef] }
]);

const phrase1 = new BiblePhrase({
    versionId: esvVersionId,
    bookOsisId: 'Gen',
    versionChapterNum: 1,
    versionVerseNum: 1,
    text: 'In the beginning',
    strong: 'G1230',
    notes: [note1]
});

const phrase2 = new BiblePhrase({
    versionId: esvVersionId,
    bookOsisId: 'Gen',
    versionChapterNum: 1,
    versionVerseNum: 1,
    text: 'god',
    bold: true,
    strong: 'G5630',
    crossReferences: [cRef]
});

phrases.push(phrase1, phrase2);

// do some magic and persist to database
const newPhrases = await sqlBible.addParagraph(phrases);

// you can also just persist phrases without creating a paragraph
const newPhrases2 = await sqlBible.addPhrases(phrases);

// ... or just a single phrase
const newPhrase = await sqlBible.addPhrase(phrase1);

// ... in which case you need to take care of adding paragraph sections yourself:
const newSection = await sqlBible.addSection(
    new BibleSection({
        level: 0,
        phraseStartId: newPhrases[0].id,
        phraseEndId: newPhrases[newPhrases.length - 1].id
    })
);

// you would do the same for higher level sections
const newTitleSection = await sqlBible.addSection(
    new BibleSection({
        level: 1,
        title: 'Creation',
        phraseStartId: newPhrases[0].id,
        phraseEndId: newPhrases[newPhrases.length - 1].id
    })
);

// after you have completed a book, we need to generate some metadata
sqlBible.generateBookMetadata(bookGenesis);

/**
 * OUTPUT
 */

// on a basic output level you can get a list of phrases like this:
const phrases = await sqlBible.getPhrases({
    versionId: 1,
    bookOsisId: 'Gen',
    versionChapterNum: 1,
    versionVerseNum: 3
});

// more output methods and features coming soon
```
