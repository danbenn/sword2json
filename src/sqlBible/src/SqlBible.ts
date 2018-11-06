import 'reflect-metadata';
import Entities from './entities';

import { createConnection, ConnectionOptions, Connection, getManager } from 'typeorm';
import { BibleSection } from './models';
import { BiblePhrase } from './entities/BiblePhrase';

export class SqlBible {
    dbReady: Promise<Connection>;
    constructor(dbConfig: ConnectionOptions) {
        this.dbReady = createConnection({
            ...dbConfig,
            entities: Entities,
            synchronize: true,
            logging: false
        });
    }

    async getSection(section: BibleSection) {
        await this.dbReady;
        section;
        return getManager().find(BiblePhrase);
    }

    async savePhrase(phrase: BiblePhrase) {
        await this.dbReady;
        return getManager().save(phrase);
    }
}
