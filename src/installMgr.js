'use strict';

var versificationMgr = require('./versificationMgr');
var async = require('async');
var tools = require('./tools');

var start = 0,
    buf = null,
    isEnd = false;

function loadModule(files) {
    for (var name in files) {
        if(name.search('.conf') !== -1) {
            const configString = Uint8ArrayToStringNodeJS(files[name])
            const configJson = tools.readConf(configString);
            const index = buildIndex(files, configJson);
            return index;
        }
    };
}

function loadNodeJSLocalModule(filename) {
    const fs = require('fs');
    const JSZip = require('jszip');
    const contents = fs.readFileSync(filename);
    const zip = new JSZip(contents);
    const filenames = Object.keys(zip.files);
    const files = {};
    filenames.forEach((name) => {
      files[name] = zip.files[name].asUint8Array();
    });
    return loadModule(files);
}

function Uint8ArrayToStringNodeJS(blob) {
    const buffer = blobToBuffer(blob);
    return buffer.toString();
}

//Build the index with all entry points for a book or chapter
function buildIndex(files, configJson) {
    const oldTestament = {};
    const newTestament = {};

    for (var name in files) {
        const file = files[name];
        if (name.includes('ot.bzs')) {
            oldTestament['bookPositions'] = file;
        }
        else if (name.includes('ot.bzv')) {
            oldTestament['chapterVersePositions'] = file;
        }
        else if (name.includes('nt.bzs')) {
            newTestament['bookPositions'] = file;
        }
        else if (name.includes('nt.bzv')) {
            newTestament['chapterVersePositions'] = file;
        }
    }

    const versification = configJson.Versification;

    const bookPosOT = getBookPositions(oldTestament.bookPositions);
    const rawPosOT = getChapterVersePositions(oldTestament.chapterVersePositions,
        bookPosOT, 'ot', versification);

    const bookPosNT = getBookPositions(newTestament.bookPositions);
    const rawPosNT = getChapterVersePositions(newTestament.chapterVersePositions,
        bookPosNT, 'nt', versification);

    const index = {
        'rawPosOT': rawPosOT,
        'rawPosNT': rawPosNT,
    }
    return index;
}

function blobToBuffer(ab) {
    var buf = new Buffer(ab.byteLength);
    var view = new Uint8Array(ab);
    for (var i = 0; i < buf.length; ++i) {
        buf[i] = view[i];
    }
    return buf;
}

//Get the positions of each book
function getBookPositions(inBuf, inCallback) {
    var startPos = 0,
        length = 0,
        unused = 0,
        res = null,
        end = false,
        bookPositions = [];
    start = 0;

    while(!end) {
        res = getIntFromStream(inBuf);
        startPos = res[0];
        end = res[1];
        if (!end) {
            res = getIntFromStream(inBuf);
            length = res[0];
            end = res[1];
            if (!end) {
                res = getIntFromStream(inBuf);
                unused = res[0];
                end = res[1];
                if (end)
                    break;
                bookPositions.push({startPos: startPos, length: length, unused: unused});
            }
        }
    }
    return bookPositions;
}

//dump some bytes in the chapter and verse index file
function dumpBytes(inBuf) {
    start = 0;

    for (var i=0;i<4;i++) {
        getShortIntFromStream(inBuf);
        getInt48FromStream(inBuf);
        getShortIntFromStream(inBuf);
    }
}
// ### This code is based on the zTextReader class from cross-connect (https://code.google.com/p/cross-connect), Copyright (C) 2011 Thomas Dilts ###

//Get the position of each chapter and verse
function getChapterVersePositions(inBuf, inBookPositions, inTestament, inV11n) {
    dumpBytes(inBuf);
    var booksStart = (inTestament === 'ot') ? 0 : versificationMgr.getBooksInOT(inV11n);
    var booksEnd = (inTestament === 'ot') ? versificationMgr.getBooksInOT(inV11n) : versificationMgr.getBooksInOT(inV11n)+versificationMgr.getBooksInNT(inV11n);
    var chapterStartPos = 0,
        lastNonZeroStartPos = 0,
        length = 0,
        chapterLength = 0,
        bookStartPos = 0,
        booknum = 0,
        verseMax = 0,
        bookData = null,
        startPos = 0,
        chapt = {},
        foundEmptyChapter = 0,
        chapters = {};

    for (var b = booksStart; b<booksEnd; b++) {
        bookData = versificationMgr.getBook(b, inV11n);
        chapters[bookData.abbrev] = [];
        foundEmptyChapter = 0;
        //console.log(bookData, chapters);
        for (var c = 0; c<bookData.maxChapter; c++) {
            chapterStartPos = 0;
            lastNonZeroStartPos = 0;
            chapt = {};
            chapt['verses'] = [];
            length = 0;
            verseMax = versificationMgr.getVersesInChapter(b,c+1, inV11n);
            for (var v = 0; v<verseMax; v++) {
                booknum = getShortIntFromStream(inBuf)[0];
                startPos = getInt48FromStream(inBuf)[0];

                if (startPos !== 0)
                    lastNonZeroStartPos = startPos;

                length = getShortIntFromStream(inBuf)[0];
                //console.log('startPos, length', startPos, length);
                if (v === 0) {
                    chapterStartPos = startPos;
                    bookStartPos = 0;
                    if (booknum < inBookPositions.length) {
                        //console.log('inBookPositions.startPos', inBookPositions[booknum].startPos, booknum, inBookPositions.length);
                        bookStartPos = inBookPositions[booknum].startPos;
                    }
                    chapt['startPos'] = chapterStartPos;
                    chapt['booknum'] = b;
                    //chapt['bookRelativeChapterNum'] = c;
                    chapt['bookStartPos'] = bookStartPos;
                }
                if (booknum === 0 && startPos === 0 && length === 0) {
                    if (chapt !== {}) {
                        chapt['verses'].push({startPos: 0, length: 0});
                    }
                } else {
                    if (chapt !== {}) {
                        chapt['verses'].push({startPos: startPos - chapterStartPos, length: length});
                    }
                }
            } //end verse
            if (chapt != {}) {
                //console.log('LENGTH:', lastNonZeroStartPos, chapterStartPos, length, c, chapt, chapters);
                chapterLength = lastNonZeroStartPos - chapterStartPos + length;
                chapt['length'] = chapterLength;
                chapters[bookData.abbrev].push(chapt);
                if (isNaN(chapterLength) || chapterLength === 0) {
                    foundEmptyChapter++;
                }

            }
            // dump a post for the chapter break
            getShortIntFromStream(inBuf);
            getInt48FromStream(inBuf);
            getShortIntFromStream(inBuf);
        } //end chapters
        //console.log('Empty Chapters:', foundEmptyChapter);
        if(foundEmptyChapter === bookData.maxChapter) {
            delete chapters[bookData.abbrev];
        }
        // dump a post for the book break
        getShortIntFromStream(inBuf);
        getInt48FromStream(inBuf);
        getShortIntFromStream(inBuf);
    } //end books
    return chapters;
}

function getRawPositions(inFile, inTestament, inV11n) {
    start = 0;
    //Dump the first 12 bytes
    getInt48FromStream(inFile);
    getInt48FromStream(inFile);

    var booksStart = (inTestament === 'ot') ? 0 : versificationMgr.getBooksInOT(inV11n);
    var booksEnd = (inTestament === 'ot') ? versificationMgr.getBooksInOT(inV11n) : versificationMgr.getBooksInOT(inV11n)+versificationMgr.getBooksInNT(inV11n);
    var length = 0,
        verseMax = 0,
        bookData = null,
        startPos = 0,
        data = {},
        osis = '';

    for (var b = booksStart; b<booksEnd; b++) {
        bookData = versificationMgr.getBook(b, inV11n);
        //Skip Book Record (6 bytes)
        getIntFromStream(inFile);
        getShortIntFromStream(inFile);
        for (var c = 0; c<bookData.maxChapter; c++) {
            verseMax = versificationMgr.getVersesInChapter(b,c+1, inV11n);

            //Skip Chapter Record
            getIntFromStream(inFile);
            getShortIntFromStream(inFile);


            for (var v = 0; v<verseMax; v++) {
                startPos = getIntFromStream(inFile)[0];
                length = getShortIntFromStream(inFile)[0];
                if (length !== 0) {
                    //console.log('VERSE', startPos, length);
                    osis = bookData.abbrev + '.' + parseInt(c+1, 10) + '.' + parseInt(v+1, 10);
                    data[osis] = {startPos: startPos, length: length};
                }
            } //end verse
        } //end chapters
    } //end books
    return data;
}

function getIntFromStream(inBuf, inCallback) {
    buf = inBuf.subarray(start, start+4);
    isEnd = false;
    start = start+4;
    if (buf.length !== 4)
        isEnd = true;
    if (inCallback)
        inCallback(buf[3] * 0x100000 + buf[2] * 0x10000 + buf[1] * 0x100 + buf[0], isEnd);
    return [buf[3] * 0x100000 + buf[2] * 0x10000 + buf[1] * 0x100 + buf[0], isEnd];
}

function getShortIntFromStream(inBuf, inCallback) {
    buf = inBuf.subarray(start, start+2);
    isEnd = false;
    start = start+2;
    if (buf.length !== 2)
        isEnd = true;
    if (inCallback)
        inCallback(buf[1] * 0x100 + buf[0], isEnd);
    return [buf[1] * 0x100 + buf[0], isEnd];
}

function getInt48FromStream(inBuf, inCallback) {
    buf = inBuf.subarray(start, start+6);
    isEnd = false;
    start = start+6;
    if (buf.length !== 6)
        isEnd = true;
    if (inCallback)
        inCallback(buf[1] * 0x100000000000 + buf[0] * 0x100000000 + buf[5] * 0x1000000 + buf[4] * 0x10000 + buf[3] * 0x100 + buf[2], isEnd);
    return [buf[1] * 0x100000000000 + buf[0] * 0x100000000 + buf[5] * 0x1000000 + buf[4] * 0x10000 + buf[3] * 0x100 + buf[2], isEnd];
}

var InstallMgr = {
    loadModule: loadModule,
    loadNodeJSLocalModule,
};

module.exports = InstallMgr;