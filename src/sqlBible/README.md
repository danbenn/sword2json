# sqlBible

## Usage

```typescript
import SqlBible from 'sql-bible';

const sqlBible = new SqlBible({
    type: 'sqlite',
    database: './bible.db'
});

const verse: BibleVerse = {
    phrases: [{ text: 'in' }, { text: 'the beginning' }]
};

sqlBible.saveVerse(verse);

const section: BibleSection = {
    refStart: {
        bookOsisId: 'GEN',
        chapterNum: 3
    }
};

const readVerses = await sqlBible.getSection(section);

const searchVerses = sqlBible.search('jesus');
```
