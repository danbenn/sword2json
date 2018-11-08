import {
  ParserContext,
  OsisXmlNode,
  NoteType,
  BibleVersion,
  Phrase,
  PhraseMorphology,
  StrongsNumber,
  StrongsPhrase,
  Footnote,
  CrossReference,
  LineBreak,
  ParagraphBreak,
  Highlighting,
  OsisXmlTag,
  Indentation,
} from './types';

const sax = require('sax');

const DEBUG_OUTPUT_ENABLED = false;

function osis2sqlite(verseXML: string) {
  const context: ParserContext = {
    currentNode: null,
    currentNoteNode: null,
    currentNoteNum: 0,
    currentCrossRefNode: null,
    quoteNode: null,
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

  if (DEBUG_OUTPUT_ENABLED) {
    const prettifyXML = require('xml-formatter');
    console.log(prettifyXML(verseXML));
    console.log('*****************************************************');
  }

  parser.write(verseXML);
  parser.close();

  addVerseNumber(verse, context.verseNum);

  return verse;
}

function addVerseNumber(verse, verseNum) {
  let index = 0;
  // Skip special elements until we get to plain text
  while (verse[index][0][0] === '$') {
    index += 1;
  }
  const verseNumElement = ['$verse-num', Number(verseNum)];
  verse.splice(index, 0, verseNumElement);
}

function parseOpeningTag(node: OsisXmlNode, verse, context: ParserContext) {
  context.currentNode = node;
  switch (node.name) {
    case OsisXmlTag.XML:
      context.osisRef = node.attributes.osisRef;
      context.verseNum = node.attributes.verseNum;
      break;
    case OsisXmlTag.NOTE:
      context.currentNoteNode = node;
      break;
    case OsisXmlTag.CROSS_REFERENCE:
      context.currentCrossRefNode = node;
      addCrossReference(context, verse);
      break;
    case OsisXmlTag.SECTION_HEADING:
      context.title = node;
      break;
    case OsisXmlTag.POETIC_LINE:
      if (node.attributes.level === Indentation.small && node.attributes.sID) {
        verse.push(['$line-break']);
        verse.push(['$indentation', 1]);
      } else if (
        node.attributes.level === Indentation.large &&
        node.attributes.sID
      ) {
        verse.push(['$line-break']);
        verse.push(['$indentation', 2]);
      }
      break;
  }
}

function addCrossReference(context, verse) {
  const letter = context.currentNoteNode.attributes.n;
  const reference = context.currentCrossRefNode.attributes.osisRef;
  const lastElement = verse[verse.length - 1];
  if (lastElement[0] === '$cross-ref' && lastElement[1] === letter) {
    verse[verse.length - 1][2].push(reference);
    return;
  }
  verse.push(['$cross-ref', letter, [reference]]);
}

function parseTextNode(text: string, verse, context: ParserContext) {
  let formattedText = text;
  if (context.currentNode && context.currentNode.name === OsisXmlTag.HIGHLIGHT) {
    formattedText = getPhraseWithHighlighting(text, context);
  }
  if (isFootnote(context.currentNoteNode)) {
    parseFootnote(formattedText, context);
    return;
  }
  if (context.currentNoteNode) {
    return;
  }
  if (text.trim().length === 0) {
    return;
  }
  if (context.quoteNode) {
    parseQuote(formattedText, context, verse);
    return;
  }
  if (context.currentNode) {
    switch (context.currentNode.name) {
      case OsisXmlTag.SECTION_HEADING:
        context.titleText += formattedText;
        break;
      case OsisXmlTag.DIVINE_NAME:
        if (context.title) {
          const strongsNumbers = getStrongsNumbers(context);
          verse.push([formattedText, strongsNumbers]);
        }
        break;
      default:
        if (hasStrongsNumbers(context.currentNode)) {
          const strongsNumbers = getStrongsNumbers(context);
          verse.push([formattedText, strongsNumbers]);
          break;
        }
        verse.push([formattedText]);
        break;
    }
  } else {
    verse.push([formattedText]);
  }
}

function parseClosingTag(tagName: string, verse, context: ParserContext) {
  switch (tagName) {
    case OsisXmlTag.SECTION_HEADING:
      verse.push([
        '$title', context.titleText.replace(/<(?:.|\n)*?>/gm, ''),
      ]);
      context.currentNode = null;
      context.title = null;
      context.titleText = '';
      break;
    case OsisXmlTag.NOTE:
      if (context.noteText.trim()) {
        verse.push(getFootnote(context));
        context.noteCount += 1;
      }
      context.noteText = '';
      context.currentNoteNode = null;
      break;
    case OsisXmlTag.CROSS_REFERENCE:
      context.currentCrossRefNode = null;
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
        context.quoteNode = null;
      }
      break;
    case OsisXmlTag.LINE_GROUP:
      // verse.push(['$paragraph-break']);
      break;
  }
  context.currentNode = null;
}

function getFootnote(context: ParserContext) {
  const referenceNum = (context.noteCount + 1).toString();
  return ['$footnote', referenceNum, context.noteText];
}

function getPhraseWithHighlighting(phrase: string, context: ParserContext) {
  switch (context.currentNode.attributes.type) {
    case Highlighting.ITALIC:
      return `"${phrase}"`;
    case Highlighting.BOLD:
      return `'${phrase}'`;
    case Highlighting.UNDERLINE:
      return `"${phrase}"`;
  }
  return phrase;
}

function parseQuote(text, verse, context) {
  const strongsNumbers = getStrongsNumbers(context);
  if (context.quoteNode.attributes.who === 'Jesus' && text) {
    verse.push([`$redLetter=${text}`]);
    return;
  }
  verse.push([text]);
  if (strongsNumbers) {
    verse[verse.length - 1].push(strongsNumbers);
  }
}
function isFootnote(node: OsisXmlNode) {
  return node && (node.attributes.type !== NoteType.CROSS_REFERENCE);
}

function hasStrongsNumbers(node: OsisXmlNode) {
  return 'attributes' in node && 'lemma' in node.attributes;
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

function parseFootnote(text: string, context: ParserContext) {
  context.currentNoteNum = Number(context.currentNoteNode.attributes.n)
                           || Number(context.noteCount);
  context.noteText += text;
}

export default osis2sqlite;
