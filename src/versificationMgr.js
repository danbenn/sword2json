'use strict';

var kjv = require("../data/kjv.json");
var german = require("../data/german.json");
var catholic = require("../data/catholic.json");
var catholic2 = require("../data/catholic2.json");
var kjva = require("../data/kjva.json");
var leningrad = require("../data/leningrad.json");
var luther = require("../data/luther.json");
var lxx = require("../data/lxx.json");
var mt = require("../data/mt.json");
var nrsv = require("../data/nrsv.json");
var nrsva = require("../data/nrsva.json");
var orthodox = require("../data/orthodox.json");
var synodal = require("../data/synodal.json");
var synodalprot = require("../data/synodalprot.json");
var vulg = require("../data/vulg.json");

var versificationMgr = {};

versificationMgr.kjv = kjv;
german["nt"] = kjv.nt;
german["osisToBookNum"] = kjv.osisToBookNum;
versificationMgr.german = german;
versificationMgr.catholic = catholic;
versificationMgr.catholic2 = catholic2;
versificationMgr.kjva = kjva;
versificationMgr.leningrad = leningrad;
versificationMgr.luther = luther;
versificationMgr.lxx = lxx;
versificationMgr.mt = mt;
versificationMgr.nrsv = nrsv;
versificationMgr.nrsva = nrsva;
versificationMgr.orthodox = orthodox;
versificationMgr.synodal = synodal;
versificationMgr.synodalprot = synodalprot;
versificationMgr.vulg = vulg;

function getBooksInOT (v11n) {
    if (v11n !== undefined && versificationMgr[v11n])
        return versificationMgr[v11n].ot.length;
    else
        return versificationMgr.kjv.ot.length;
}

function getBooksInNT (v11n) {
    if (v11n !== undefined && versificationMgr[v11n])
        return versificationMgr[v11n].nt.length;
    else
        return versificationMgr.kjv.nt.length;
}

function getChapterMax (inBookNum, v11n) {
    inBookNum = (inBookNum < 0) ? 0 : inBookNum;
    var booksOT = getBooksInOT(v11n);
    var testament = (inBookNum < booksOT) ? "ot" : "nt";
    inBookNum = (inBookNum < booksOT) ? inBookNum : inBookNum - booksOT;
    if (v11n !== undefined && versificationMgr[v11n])
        return versificationMgr[v11n][testament][inBookNum].maxChapter;
    else
        return versificationMgr.kjv[testament][inBookNum].maxChapter;
}

function getVersesInChapter (inBookNum, inChapter, v11n) {
    if (v11n !== undefined && versificationMgr[v11n])
        return versificationMgr[v11n].versesInChapter[inBookNum][parseInt(inChapter, 10)-1];
    else
        return versificationMgr.kjv.versesInChapter[inBookNum][parseInt(inChapter, 10)-1];
}

function getBook(inBookNum, v11n) {
    inBookNum = (inBookNum < 0) ? 0 : inBookNum;
    var booksOT = getBooksInOT(v11n);
    var testament = (inBookNum < booksOT) ? "ot" : "nt";
    inBookNum = (inBookNum < booksOT) ? inBookNum : inBookNum - booksOT;
    if (v11n !== undefined && versificationMgr[v11n])
        return versificationMgr[v11n][testament][inBookNum];
    else
        return versificationMgr.kjv[testament][inBookNum];
}

function getBookNum(inOsis, v11n) {
    //console.log(inOsis, v11n, versificationMgr.kjv.osisToBookNum[inOsis]);
    if (v11n !== undefined && versificationMgr[v11n] && versificationMgr[v11n].osisToBookNum)
        return versificationMgr[v11n].osisToBookNum[inOsis];
    else
        return versificationMgr.kjv.osisToBookNum[inOsis];
}

module.exports = {
    getBooksInOT: getBooksInOT,
    getBooksInNT: getBooksInNT,
    getChapterMax: getChapterMax,
    getVersesInChapter: getVersesInChapter,
    getBook: getBook,
    getBookNum: getBookNum,
};