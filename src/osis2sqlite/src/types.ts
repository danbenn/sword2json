export type BibleVersion = {
  version: string;
  language: string;
  name: string;
  copyright: string;
};

export type Phrase = {
  phraseId: number;
  phrase: string;
  referenceId: number;
};

export type Reference = {
  referenceId: number;
  bookId: number;
  chapterNum: number;
  verseNum: number;
  versionId: number;
};

export type Book = {
  bookId: number;
  osisName: string;
};

export type PhraseStyle = {
  phraseId: number;
  style: string;
};

export type PhraseMorphology = {
  phraseId: number;
  type: string;
  tense: string;
  mood: string;
  case: string;
  person: string;
  number: string;
  gender: string;
  extra: string;
  stem: string;
  voice: string;
  action: string;
  aspect: string;
};

export type StrongsNumber = {
  strongsNumberId: string;
  lemma: string;
  gloss: string;
};

export type StrongsPhrase = {
  phraseId: number;
  strongsRef: string;
};

export type Footnote = {
  phraseId: number;
  content: string;
};

export type CrossReference = {
  phraseId: number;
  letter: string;
  referenceId: number;
  endReferenceId: number;
};

export type SectionHeading = {
  phraseId: number;
  title: string;
};

export type SectionSubHeading = {
  phraseId: number;
  text: string;
};

export type LineBreak = {
  phraseId: number;
};

export type ParagraphBreak = {
  phraseId: number;
};

export type IndentationTab = {
  phraseId: number;
  indentLevel: number;
};

export type ParserContext = {
  currentNode: OsisXmlNode;
  currentNoteNode: OsisXmlNode;
  currentNoteNum: number;
  currentCrossRefNode: OsisXmlNode;
  quoteNode: OsisXmlNode;
  verseNum: string;
  noteText: string;
  osisRef: string;
  footnotesData: any;
  noteCount: number;
  title: OsisXmlNode;
  titleText: string;
};

export type OsisXmlNode = {
  attributes: {
    annotateRef: string,
    eID?: string,
    lemma?: string,
    level?: string,
    marker?: string,
    n?: string,
    osisID?: string,
    osisRef: string,
    sID?: string,
    subType?: string,
    type?: string,
    verseNum?: string,
    who?: string,
  };
  isSelfClosing: boolean;
  name: string;
};

export enum NoteType {
  CROSS_REFERENCE = 'crossReference',
}

export enum Indentation {
  small = '1',
  large = '2',
}

export enum Highlighting {
  ITALIC = 'italic',
  BOLD = 'bold',
  UNDERLINE = 'underline',
}

export enum OsisXmlTag {
  CROSS_REFERENCE = 'reference',
  DIVINE_NAME = 'divineName',
  HIGHLIGHT = 'hi',
  LINE_GROUP = 'lg',
  NOTE = 'note',
  POETIC_LINE = 'l',
  QUOTE = 'q',
  SECTION_HEADING = 'title',
  XML = 'xml',
}
