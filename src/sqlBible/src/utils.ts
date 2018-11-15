import { getBookIdFromOsisId, getOsisIdFromBookId } from './data/bibleMeta';
import { IBiblePhraseRef } from './models/IBiblePhraseRef.interface';

export const generatePhraseId = (
    osisBookId: string,
    normalizedChapterNum = 0,
    normalizedVerseNum = 0,
    versionId = 0,
    versionChapterNum = 0,
    versionVerseNum = 0,
    phraseNum = 0
) =>
    pad(getBookIdFromOsisId(osisBookId), 2) +
    '' +
    pad(normalizedChapterNum, 3) +
    '' +
    pad(normalizedVerseNum, 3) +
    '' +
    pad(versionId, 3) +
    '' +
    pad(versionChapterNum, 3) +
    '' +
    pad(versionVerseNum, 3) +
    '' +
    pad(phraseNum, 2);

export function pad(n: number, width: number, z?: string) {
    z = z || '0';
    let nStr = n + '';
    return nStr.length >= width ? nStr : new Array(width - nStr.length + 1).join(z) + n;
}

export const parsePhraseId = (id: string) => {
    const ret: Partial<IBiblePhraseRef> = {};
    let _version = +id.substr(-11);
    const phraseNum = _version % 100;
    _version -= phraseNum;
    _version /= 100;
    ret.versionVerseNum = _version % 1000;
    _version -= ret.versionVerseNum;
    _version /= 1000;
    ret.versionChapterNum = _version % 1000;
    _version -= ret.versionChapterNum;
    _version /= 1000;
    ret.versionId = _version;
    let _normalized = +id.substring(0, id.length - 11);
    ret.normalizedVerseNum = _normalized % 1000;
    _normalized -= ret.normalizedVerseNum;
    _normalized /= 1000;
    ret.normalizedChapterNum = _normalized % 1000;
    _normalized -= ret.normalizedChapterNum;
    _normalized /= 1000;
    const normalizedBookNum = _normalized;
    ret.osisBookId = getOsisIdFromBookId(normalizedBookNum);
    return <IBiblePhraseRef>ret;
};
