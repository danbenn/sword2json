import kjvJson from '../data/kjv.json';
import germanJson from '../data/german.json';
import catholicJson from '../data/catholic.json';
import catholic2Json from '../data/catholic2.json';
import kjvaJson from '../data/kjva.json';
import leningradJson from '../data/leningrad.json';
import lutherJson from '../data/luther.json';
import lxxJson from '../data/lxx.json';
import mtJson from '../data/mt.json';
import nrsvJson from '../data/nrsv.json';
import nrsvaJson from '../data/nrsva.json';
import orthodoxJson from '../data/orthodox.json';
import synodalJson from '../data/synodal.json';
import synodalprotJson from '../data/synodalprot.json';
import vulgJson from '../data/vulg.json';

const versificationMgr: any = {};

versificationMgr.kjv = kjvJson;
versificationMgr.german = germanJson;
versificationMgr.catholic = catholicJson;
versificationMgr.catholic2 = catholic2Json;
versificationMgr.kjva = kjvaJson;
versificationMgr.leningrad = leningradJson;
versificationMgr.luther = lutherJson;
versificationMgr.lxx = lxxJson;
versificationMgr.mt = mtJson;
versificationMgr.nrsv = nrsvJson;
versificationMgr.nrsva = nrsvaJson;
versificationMgr.orthodox = orthodoxJson;
versificationMgr.synodal = synodalJson;
versificationMgr.synodalprot = synodalprotJson;
versificationMgr.vulg = vulgJson;

function getBooksInOT(v11n: string) {
  if (v11n !== undefined && versificationMgr[v11n]) { return versificationMgr[v11n].ot.length; }
  return versificationMgr.kjv.ot.length;
}

function getBooksInNT(v11n: string) {
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

function getVersesInChapter(inBookNum: number, inChapter: number, v11n: string) {
  if (v11n !== undefined && versificationMgr[v11n]) { return versificationMgr[v11n].versesInChapter[inBookNum][inChapter - 1]; }
  return versificationMgr.kjv.versesInChapter[inBookNum][inChapter - 1];
}

function getBook(inBookNum: number, v11n: string) {
  inBookNum = (inBookNum < 0) ? 0 : inBookNum;
  const booksOT = getBooksInOT(v11n);
  const testament = (inBookNum < booksOT) ? 'ot' : 'nt';
  inBookNum = (inBookNum < booksOT) ? inBookNum : inBookNum - booksOT;
  if (v11n !== undefined && versificationMgr[v11n]) { return versificationMgr[v11n][testament][inBookNum]; }
  return versificationMgr.kjv[testament][inBookNum];
}

function getBookNum(inOsis: string, v11n: string) {
  // console.log(inOsis, v11n, versificationMgr.kjv.osisToBookNum[inOsis]);
  if (v11n !== undefined && versificationMgr[v11n] && versificationMgr[v11n].osisToBookNum) { return versificationMgr[v11n].osisToBookNum[inOsis]; }
  return versificationMgr.kjv.osisToBookNum[inOsis];
}

export default {
  getBooksInOT,
  getBooksInNT,
  getChapterMax,
  getVersesInChapter,
  getBook,
  getBookNum,
};
