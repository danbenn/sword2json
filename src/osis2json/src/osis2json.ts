import * as types from './types';

const sax = require('sax');

const parser = sax.parser(true); // strict = true

const defaultFilterOptions = {
  headings: true,
  footnotes: true,
  crossReferences: false,
  strongsNumbers: true,
  indentation: true,
  wordsOfChristInRed: false,
  oneVersePerLine: false,
  array: false,
};

let lastTag = '';
let currentNode = null;
let currentNote = null;
let currentRef = null;
let quote = null;
let verseData = null;
let noteText = '';
let outText = '';
let renderedText = '';
let verseArray = [];
let osisRef = '';
let footnotesData = {};
const isSelfClosing = false;
let isTitle = false;
let noteCount = 0;

function osis2json(verseXML: string, debugOutputEnabled = false) {
  const filterOptions: types.JsonFilterOptions = defaultFilterOptions;

  const verse = [];

  lastTag = '';
  currentNode = null;
  currentNote = null;
  currentRef = null;
  quote = null;
  let title = null;
  let titleText = '';
  verseData = null;
  noteText = '';
  outText = '';
  renderedText = '';
  verseArray = [];
  osisRef = '';
  footnotesData = {};
  isTitle = false;
  noteCount = 0;

  // Handle Parsing errors
  parser.onerror = function (e) {
    parser.resume();
  };

  // Text node
  parser.ontext = function (t) {
    if (currentNote) {
      processFootnotes(t, filterOptions);
    } else if (quote) {
      const strongsNumbers = getStrongsNumbers();
      if (quote.attributes.who === 'Jesus' && filterOptions.wordsOfChristInRed && t) {
        verse.push([`$redLetter=${t}`]);
        return;
      }
      verse.push([t]);
      if (strongsNumbers) {
        verse[verse.length - 1].push(strongsNumbers);
      }
    } else if (currentNode) {
      switch (currentNode.name) {
        case 'title':
          if (filterOptions.headings) {
            titleText += t;
          }
          break;
        case 'divineName':
          if (title && filterOptions.headings) {
            const strongsNumbers = getStrongsNumbers();
            verse.push([t, strongsNumbers]);
          }
          break;
        case 'hi':
          if ('attributes' in currentNode && 'lemma' in currentNode.attributes) {
            const strongsNumbers = getStrongsNumbers();
            verse.push([t, strongsNumbers]);
          } else {
            verse.push([t]);
          }
          break;
        default:
          if ('attributes' in currentNode && 'lemma' in currentNode.attributes) {
            const strongsNumbers = getStrongsNumbers();
            verse.push([t, strongsNumbers]);
            break;
          }
          verse.push([t]);
          outText += t;
          break;
      }
    } else {
      verse.push([t]);
    }
  };

  // Handle opening tags
  parser.onopentag = function (node) {
    // console.log(node);
    currentNode = node;
    lastTag = node.name;
    switch (node.name) {
      case 'xml': // enclosing tag of entire body of content
        verseData = { osisRef: node.attributes.osisRef, verseNum: node.attributes.verseNum };
        break;
      case 'note': // footnote or cross-reference object
        if (node.attributes.type === 'crossReference' && filterOptions.crossReferences) {
          verse.push(['$crossref']);
        } else if (filterOptions.footnotes && node.attributes.type !== 'crossReference') {
          osisRef = node.attributes.osisRef || node.attributes.annotateRef || verseData.osisRef;
          if (!node.attributes.n) noteCount += 1;
          const n = node.attributes.n || noteCount;
          verse.push([`$note=${n}&osisRef=${osisRef}`]);
        }
        currentNote = node;
        break;
      case 'reference': // cross-reference element
        currentRef = node;
        break;
      case 'title': // section heading
        title = node;
        break;
      case 'l': // line indentation
        if (filterOptions.indentation) {
          if (node.attributes.level === '1' && node.attributes.sID) {
            verse.push(['$line-break']);
            verse.push(['$small-indent']);
          } else if (node.attributes.level === '2' && node.attributes.sID) {
            verse.push(['$line-break']);
            verse.push(['$large-indent']);
          }
        }
        break;
    }
  };

  parser.onclosetag = function (tagName) {
    switch (tagName) {
      case 'title':
        verse.push([`$heading=${titleText.replace(/<(?:.|\n)*?>/gm, '')}`]);
        currentNode = null;
        title = null;
        titleText = '';
        break;
      case 'note':
        noteText = '';
        currentNote = null;
        break;
      case 'reference':
        currentRef = null;
        break;
      case 'q':
        const isClosingQuotationMark = currentNode && currentNode.isSelfClosing
          && currentNode.attributes.marker;
        if (isClosingQuotationMark) {
          // Add closing quote mark
          verse.push([currentNode.attributes.marker]);
        }
        if (!currentNode) {
          quote = null;
        }
        break;
      case 'lg': // 'line group' (paragraph)
        verse.push(['$paragraph-break']);
        break;
    }
    lastTag = '';
    currentNode = null;
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

function getStrongsNumbers() {
  if (!currentNode) {
    return null;
  }
  const strongsNumbersString = currentNode.attributes.lemma.replace(' ', '');
  const strongsNumbers = strongsNumbersString.split('strong:');
  strongsNumbers.shift();
  return strongsNumbers;
}

function processFootnotes(t: string, filterOptions: types.JsonFilterOptions) {
  let out = '';
  if (currentNote.attributes.type === 'crossReference' && filterOptions.crossReferences) {
    if (lastTag !== 'reference') {
      out += processCrossReference(t);
    } else {
      const refOsis = currentRef.attributes.osisRef;
      const noteOsis = currentNote.attributes.osisRef;
      const crossRef = (currentRef) ? refOsis :noteOsis;
      out += `<a href="?type=crossReference&osisRef=${crossRef}&n=${
        currentNote.attributes.n}">${t}</a>`;
    }
  } else if (filterOptions.footnotes && currentNote.attributes.type !== 'crossReference') {
    const noteOsis = currentNote.attributes.osisRef;
    osisRef = noteOsis || currentNote.attributes.annotateRef || verseData.osisRef;
    const n = currentNote.attributes.n || noteCount;
    if (!footnotesData.hasOwnProperty(osisRef)) {
      footnotesData[osisRef] = [{ n, note: t }];
    } else if (footnotesData[osisRef][footnotesData[osisRef].length - 1].n === n) {
      footnotesData[osisRef][footnotesData[osisRef].length - 1].note += t;
    } else {
      footnotesData[osisRef].push({ n, note: t });
    }
  }
  return footnotesData;
}

function processCrossReference(inText) {
  let out = '';
  const osisRef = inText;
  if (osisRef !== '' && currentRef) {
    const n = currentRef.attributes.n || currentNote.attributes.n;
    out += `<a href="?type=crossReference&osisRef=${osisRef}&n=${n}">${inText}</a>`;
  } else {
    out += inText;
  }
  return out;
}

export default osis2json;
