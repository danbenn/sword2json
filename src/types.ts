import { ChapterPosition } from './types';
export interface VerseMetadata {
  book: string;
  bookNum: number;
  chapter: number;
  osis: string;
  verse: number;
}

export interface ChapterPosition {
  bookStartPos: number;
  booknum: number;
  length: number;
  startPos: number;
  verses: VersePosition[];
}

export interface VersePosition {
  length: number;
  startPos: number;
}

export interface JsonFilterOptions {
  headings: true;
  footnotes: true;
  crossReferences: false;
  strongsNumbers: true;
  indentation: true;
  wordsOfChristInRed: false;
  oneVersePerLine: false;
  array: false;
}

export interface VerseXML {
  text: string;
  verse: number;
}

export interface ChapterXML {
  intro: string;
  verses: VerseXML[];
}

