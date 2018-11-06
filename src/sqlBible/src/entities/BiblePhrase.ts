import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class BiblePhrase {
    @PrimaryGeneratedColumn()
    id?: number;
    @Column()
    text: string;
}
