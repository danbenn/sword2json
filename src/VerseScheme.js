

const kjv = require('../data/kjv.json');
const german = require('../data/german.json');
const catholic = require('../data/catholic.json');
const catholic2 = require('../data/catholic2.json');
const kjva = require('../data/kjva.json');
const leningrad = require('../data/leningrad.json');
const luther = require('../data/luther.json');
const lxx = require('../data/lxx.json');
const mt = require('../data/mt.json');
const nrsv = require('../data/nrsv.json');
const nrsva = require('../data/nrsva.json');
const orthodox = require('../data/orthodox.json');
const synodal = require('../data/synodal.json');
const synodalprot = require('../data/synodalprot.json');
const vulg = require('../data/vulg.json');

const versificationMgr = {};

versificationMgr.kjv = kjv;
german.nt = kjv.nt;
german.osisToBookNum = kjv.osisToBookNum;
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

function getBooksInOT(v11n) {
  if (v11n !== undefined && versificationMgr[v11n]) { return versificationMgr[v11n].ot.length; }
  return versificationMgr.kjv.ot.length;
}

function getBooksInNT(v11n) {
  if (v11n !== undefined && versificationMgr[v11n]) { return versificationMgr[v11n].nt.length; }
  return versificationMgr.kjv.nt.length;
}

function getChapterMax(inBookNum, v11n) {
  inBookNum = (inBookNum < 0) ? 0 : inBookNum;
  const booksOT = getBooksInOT(v11n);
  const testament = (inBookNum < booksOT) ? 'ot' : 'nt';
  inBookNum = (inBookNum < booksOT) ? inBookNum : inBookNum - booksOT;
  if (v11n !== undefined && versificationMgr[v11n]) { return versificationMgr[v11n][testament][inBookNum].maxChapter; }
  return versificationMgr.kjv[testament][inBookNum].maxChapter;
}

function getVersesInChapter(inBookNum, inChapter, v11n) {
  if (v11n !== undefined && versificationMgr[v11n]) { return versificationMgr[v11n].versesInChapter[inBookNum][parseInt(inChapter, 10) - 1]; }
  return versificationMgr.kjv.versesInChapter[inBookNum][parseInt(inChapter, 10) - 1];
}

function getBook(inBookNum, v11n) {
  inBookNum = (inBookNum < 0) ? 0 : inBookNum;
  const booksOT = getBooksInOT(v11n);
  const testament = (inBookNum < booksOT) ? 'ot' : 'nt';
  inBookNum = (inBookNum < booksOT) ? inBookNum : inBookNum - booksOT;
  if (v11n !== undefined && versificationMgr[v11n]) { return versificationMgr[v11n][testament][inBookNum]; }
  return versificationMgr.kjv[testament][inBookNum];
}

function getBookNum(inOsis, v11n) {
  // console.log(inOsis, v11n, versificationMgr.kjv.osisToBookNum[inOsis]);
  if (v11n !== undefined && versificationMgr[v11n] && versificationMgr[v11n].osisToBookNum) { return versificationMgr[v11n].osisToBookNum[inOsis]; }
  return versificationMgr.kjv.osisToBookNum[inOsis];
}

module.exports = {
  getBooksInOT,
  getBooksInNT,
  getChapterMax,
  getVersesInChapter,
  getBook,
  getBookNum,
};
