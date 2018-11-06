import { SqlBible } from './SqlBible';
import { BiblePhrase } from './entities/BiblePhrase';

(async () => {
    const sqlBible = new SqlBible({
        type: 'sqlite',
        database: 'bible.db'
    });

    const phrase = new BiblePhrase();
    phrase.text = 'in the beginning';
    await sqlBible.savePhrase(phrase);

    const section = await sqlBible.getSection({
        refStart: {
            bookOsisId: 'GEN',
            chapterNum: 1
        },
        versionId: 'ESV'
    });
    console.log(section);
})();
