import * as types from './types';

const sax = require('sax');

const parser = sax.parser(true); // strict = true

interface ParserContext {
  lastTag: string;
  currentNode: any;
  currentNote: any;
  currentRef: any;
  quote: any;
  verseNum: number;
  noteText: string;
  osisRef: string;
  footnotesData: any;
  noteCount: number;
  title: any;
  titleText: string;
}

enum OsisTag {
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

  const verse = [];

  // Handle Parsing errors
  parser.onerror = () => parser.resume();

  // Text node
  parser.ontext = function (t) {
    if (context.currentNote) {
      processFootnotes(t, context);
    } else if (context.quote) {
      const strongsNumbers = getStrongsNumbers(context);
      if (context.quote.attributes.who === 'Jesus' && t) {
        verse.push([`$redLetter=${t}`]);
        return;
      }
      verse.push([t]);
      if (strongsNumbers) {
        verse[verse.length - 1].push(strongsNumbers);
      }
    } else if (context.currentNode) {
      switch (context.currentNode.name) {
        case OsisTag.SECTION_HEADING:
          context.titleText += t;
          break;
        case OsisTag.DIVINE_NAME:
          if (context.title) {
            const strongsNumbers = getStrongsNumbers(context);
            verse.push([t, strongsNumbers]);
          }
          break;
        default:
          if ('attributes' in context.currentNode && 'lemma' in context.currentNode.attributes) {
            const strongsNumbers = getStrongsNumbers(context);
            verse.push([t, strongsNumbers]);
            break;
          }
          verse.push([t]);
          break;
      }
    } else {
      verse.push([t]);
    }
  };

  // Handle opening tags
  parser.onopentag = function (node) {
    // console.log(node);
    context.currentNode = node;
    context.lastTag = node.name;
    switch (node.name) {
      case OsisTag.XML: // enclosing tag of entire body of content
        context.osisRef = node.attributes.osisRef;
        context.verseNum = node.attributes.verseNum;
        break;
      case OsisTag.NOTE: // footnote or cross-reference object
        if (node.attributes.type !== 'crossReference') {
          const osisRef = node.attributes.osisRef || node.attributes.annotateRef || context.osisRef;
          if (!node.attributes.n) context.noteCount += 1;
          const n = node.attributes.n || context.noteCount;
          verse.push([`$note=${n}&osisRef=${osisRef}`]);
        }
        context.currentNote = node;
        break;
      case OsisTag.CROSS_REFERENCE: // cross-reference element
        context.currentRef = node;
        break;
      case OsisTag.SECTION_HEADING: // section heading
        context.title = node;
        break;
      case OsisTag.POETIC_LINE: // line indentation
        if (node.attributes.level === Indentation.small && node.attributes.sID) {
          verse.push(['$line-break']);
          verse.push(['$small-indent']);
        } else if (node.attributes.level === Indentation.large && node.attributes.sID) {
          verse.push(['$line-break']);
          verse.push(['$large-indent']);
        }
        break;
    }
  };

  parser.onclosetag = function (tagName) {
    switch (tagName) {
      case OsisTag.SECTION_HEADING:
        verse.push([`$heading=${context.titleText.replace(/<(?:.|\n)*?>/gm, '')}`]);
        context.currentNode = null;
        context.title = null;
        context.titleText = '';
        break;
      case OsisTag.NOTE:
        context.noteText = '';
        context.currentNote = null;
        break;
      case OsisTag.CROSS_REFERENCE:
        context.currentRef = null;
        break;
      case OsisTag.QUOTE:
        const isClosingQuotationMark = context.currentNode && context.currentNode.isSelfClosing
          && context.currentNode.attributes.marker;
        if (isClosingQuotationMark) {
          // Add closing quote mark
          verse.push([context.currentNode.attributes.marker]);
        }
        if (!context.currentNode) {
          context.quote = null;
        }
        break;
      case OsisTag.LINE_GROUP: // 'line group' (paragraph)
        verse.push(['$paragraph-break']);
        break;
    }
    context.lastTag = '';
    context.currentNode = null;
  };

  if (debugOutputEnabled) {
    // If developing, feel free to comment this out to pretty-print your XML.
    const prettifyXML = require('xml-formatter');
    // console.log(prettifyXML(rawXML));
    console.log('*****************************************************');
  }

  parser.write(verseXML);
  parser.close();

  if (debugOutputEnabled) {
    const renderedText = renderVerseAsFormattedText(verse);
    console.log(renderedText);
  }

  return verse;
}

/**
 * Render verse without any metadata or formatting information:
 * ['in the beginning, ', ['G1039']], ['God', ['G4932']] ==>
 * 'In the beginning, God'
 */
function renderVerseAsPlainText(verse) {
  let plaintext = '';
  verse.forEach((verseBit) => {
    if (!verseBit[0].includes('$')) {
      plaintext += verseBit[0];
    }
  });
  // Remote duplicate whitespace
  plaintext = plaintext.replace(/\s+/g, ' ');
  plaintext += ' ';
  return plaintext;
}

/**
 * Render verse with formatting information. This includes:
 * • Tabs
 * • Indentation
 * • Section headings
 */
function renderVerseAsFormattedText(verse) {
  let formattedText = '';
  verse.forEach((verseBit) => {
    if (verseBit[0].includes('$heading')) {
      formattedText += '\n\n';
      formattedText += verseBit[0].replace('$heading=', '');
      formattedText += '\n\n';
    } else if (verseBit[0].includes('$line-break')) {
      formattedText += '\n';
    } else if (verseBit[0].includes('$small-indent')) {
      formattedText += '\t';
    } else if (verseBit[0].includes('$large-indent')) {
      formattedText += '\t\t';
    } else if (verseBit[0].includes('$paragraph-break')) {
      formattedText += '\n';
    } else if (!verseBit[0].includes('$')) {
      formattedText += verseBit[0];
    }
  });
  // Remote duplicate whitespace
  // formattedText = formattedText.replace(/\s+/g,' ');
  formattedText += ' ';
  return formattedText;
}

function getStrongsNumbers(context) {
  if (!context.currentNode) {
    return null;
  }
  const strongsNumbersString = context.currentNode.attributes.lemma.replace(' ', '');
  const strongsNumbers = strongsNumbersString.split('strong:');
  strongsNumbers.shift();
  return strongsNumbers;
}

function processFootnotes(t: string, context: ParserContext) {
  let out = '';
  if (context.currentNote.attributes.type === 'crossReference') {
    /*
    if (context.lastTag !== OsisTag.CROSS_REFERENCE) {
      const crossRef = processCrossReference(t, context);
      return crossRef;
    }
    const refOsis = context.currentRef.attributes.osisRef;
    const noteOsis = context.currentNote.attributes.osisRef;
    const crossRef = (context.currentRef) ? refOsis :noteOsis;
    console.log(noteOsis);
    out += `<a href="?type=crossReference&osisRef=${crossRef}&n=${
      context.currentNote.attributes.n}">${t}</a>`;
    */
  } else if (context.currentNote.attributes.type !== 'crossReference') {
    const noteOsis = context.currentNote.attributes.osisRef;
    const osisRef = noteOsis || context.currentNote.attributes.annotateRef || context.osisRef;
    const n = context.currentNote.attributes.n || context.noteCount;
    if (!context.footnotesData.hasOwnProperty(osisRef)) {
      context.footnotesData[osisRef] = [{ n, note: t }];
    } else if (context.footnotesData[osisRef][context.footnotesData[osisRef].length - 1].n === n) {
      context.footnotesData[osisRef][context.footnotesData[osisRef].length - 1].note += t;
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
    const n = context.currentRef.attributes.n || context.currentNote.attributes.n;
    out += `$crossRef=&osisRef=${osisRef}&n=${n}">${inText}</a>`;
  } else {
    out += inText;
  }
  console.log(out);
  return out;
}

export default osis2sqlite;
