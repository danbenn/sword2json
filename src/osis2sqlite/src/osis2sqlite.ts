import * as types from './types';

const sax = require('sax');

interface ParserContext {
  lastTag: string;
  currentNode: OsisXmlNode;
  currentNote: OsisXmlNode;
  currentRef: OsisXmlNode;
  quote: OsisXmlNode;
  verseNum: string;
  noteText: string;
  osisRef: string;
  footnotesData: any;
  noteCount: number;
  title: OsisXmlNode;
  titleText: string;
}

interface OsisXmlNode {
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
}

enum OsisXmlTag {
  SECTION_HEADING = 'title',
  DIVINE_NAME = 'divineName',
  NOTE = 'note',
  CROSS_REFERENCE = 'reference',
  XML = 'xml',
  POETIC_LINE = 'l',
  LINE_GROUP = 'lg',
  QUOTE = 'q',
}

enum Indentation {
  small = '1',
  large = '2',
}

function osis2sqlite(verseXML: string, debugOutputEnabled = false) {
  const context: ParserContext = {
    lastTag: '',
    currentNode: null,
    currentNote: null,
    currentRef: null,
    quote: null,
    verseNum: null,
    noteText: '',
    osisRef: '',
    footnotesData: {},
    noteCount: 0,
    title: null,
    titleText: '',
  };

  const STRICT_MODE = true;
  const parser = sax.parser(STRICT_MODE);

  const verse: any = [];

  parser.ontext = (text: string) => parseTextNode(text, verse, context);
  parser.onopentag = (node: OsisXmlNode) => parseOpeningTag(node, verse, context);
  parser.onclosetag = (tagName: string) =>
    parseClosingTag(tagName, verse, context);
  parser.onerror = () => parser.resume();

  if (debugOutputEnabled) {
    const prettifyXML = require('xml-formatter');
    console.log('*****************************************************');
  }

  parser.write(verseXML);
  parser.close();

  return verse;
}

function parseOpeningTag(node: OsisXmlNode, verse, context: ParserContext) {
  context.currentNode = node;
  context.lastTag = node.name;
  switch (node.name) {
    case OsisXmlTag.XML:
      context.osisRef = node.attributes.osisRef;
      context.verseNum = node.attributes.verseNum;
      break;
    case OsisXmlTag.NOTE:
      if (node.attributes.type !== 'crossReference') {
        const osisRef =
          node.attributes.osisRef ||
          node.attributes.annotateRef ||
          context.osisRef;
        if (!node.attributes.n) context.noteCount += 1;
        const n = node.attributes.n || context.noteCount;
        verse.push([`$note=${n}&osisRef=${osisRef}`]);
      }
      context.currentNote = node;
      break;
    case OsisXmlTag.CROSS_REFERENCE:
      context.currentRef = node;
      break;
    case OsisXmlTag.SECTION_HEADING:
      context.title = node;
      break;
    case OsisXmlTag.POETIC_LINE:
      if (node.attributes.level === Indentation.small && node.attributes.sID) {
        verse.push(['$line-break']);
        verse.push(['$small-indent']);
      } else if (
        node.attributes.level === Indentation.large &&
        node.attributes.sID
      ) {
        verse.push(['$line-break']);
        verse.push(['$large-indent']);
      }
      break;
  }
}

function parseClosingTag(tagName: string, verse, context: ParserContext) {
  switch (tagName) {
    case OsisXmlTag.SECTION_HEADING:
      verse.push([
        `$heading=${context.titleText.replace(/<(?:.|\n)*?>/gm, '')}`,
      ]);
      context.currentNode = null;
      context.title = null;
      context.titleText = '';
      break;
    case OsisXmlTag.NOTE:
      context.noteText = '';
      context.currentNote = null;
      break;
    case OsisXmlTag.CROSS_REFERENCE:
      context.currentRef = null;
      break;
    case OsisXmlTag.QUOTE:
      const isClosingQuotationMark =
        context.currentNode &&
        context.currentNode.isSelfClosing &&
        context.currentNode.attributes.marker;
      if (isClosingQuotationMark) {
        verse.push([context.currentNode.attributes.marker]);
      }
      if (!context.currentNode) {
        context.quote = null;
      }
      break;
    case OsisXmlTag.LINE_GROUP:
      verse.push(['$paragraph-break']);
      break;
  }
  context.lastTag = '';
  context.currentNode = null;
}

function parseTextNode(text: string, verse, context: ParserContext) {
  if (context.currentNote) {
    processFootnotes(text, context);
    return;
  }
  if (context.quote) {
    const strongsNumbers = getStrongsNumbers(context);
    if (context.quote.attributes.who === 'Jesus' && text) {
      verse.push([`$redLetter=${text}`]);
      return;
    }
    verse.push([text]);
    if (strongsNumbers) {
      verse[verse.length - 1].push(strongsNumbers);
    }
    return;
  }
  if (context.currentNode) {
    switch (context.currentNode.name) {
      case OsisXmlTag.SECTION_HEADING:
        context.titleText += text;
        break;
      case OsisXmlTag.DIVINE_NAME:
        if (context.title) {
          const strongsNumbers = getStrongsNumbers(context);
          verse.push([text, strongsNumbers]);
        }
        break;
      default:
        if (hasStrongsNumbers(context.currentNode)) {
          const strongsNumbers = getStrongsNumbers(context);
          verse.push([text, strongsNumbers]);
          break;
        }
        verse.push([text]);
        break;
    }
  } else {
    verse.push([text]);
  }
}

function hasStrongsNumbers(currentNode: OsisXmlNode) {
  return 'attributes' in currentNode && 'lemma' in currentNode.attributes;
}

function getStrongsNumbers(context: ParserContext) {
  if (!context.currentNode) {
    return null;
  }
  const strongsNumbersString = context.currentNode.attributes.lemma.replace(
    ' ',
    '',
  );
  const strongsNumbers = strongsNumbersString.split('strong:');
  strongsNumbers.shift();
  return strongsNumbers;
}

function processFootnotes(t: string, context: ParserContext) {
  let out = '';
  if (context.currentNote.attributes.type === 'crossReference') {
    /*
    if (context.lastTag !== OsisXmlTag.CROSS_REFERENCE) {
      const crossRef = processCrossReference(t, context);
      return crossRef;
    }
    const refOsis = context.currentRef.attributes.osisRef;
    const noteOsis = context.currentNote.attributes.osisRef;
    const crossRef = (context.currentRef) ? refOsis :noteOsis;
    console.log(noteOsis);
    out += `<a href='?type=crossReference&osisRef=${crossRef}&n=${
      context.currentNote.attributes.n}'>${t}</a>`;
    */
  } else if (context.currentNote.attributes.type !== 'crossReference') {
    const noteOsis = context.currentNote.attributes.osisRef;
    const osisRef =
      noteOsis || context.currentNote.attributes.annotateRef || context.osisRef;
    const n = context.currentNote.attributes.n || context.noteCount;
    if (!context.footnotesData.hasOwnProperty(osisRef)) {
      context.footnotesData[osisRef] = [{ n, note: t }];
    } else if (
      context.footnotesData[osisRef][context.footnotesData[osisRef].length - 1]
        .n === n
    ) {
      context.footnotesData[osisRef][
        context.footnotesData[osisRef].length - 1
      ].note += t;
    } else {
      context.footnotesData[osisRef].push({ n, note: t });
    }
  }
  return context.footnotesData;
}

function processCrossReference(inText, context) {
  let out = '';
  const osisRef = inText;
  if (osisRef !== '' && context.currentRef) {
    const n =
      context.currentRef.attributes.n || context.currentNote.attributes.n;
    out += `$crossRef=&osisRef=${osisRef}&n=${n}'>${inText}</a>`;
  } else {
    out += inText;
  }
  console.log(out);
  return out;
}

export default osis2sqlite;
