import { getBookGenericIdFromOsisId, getOsisIdFromBookGenericId } from './data/bibleMeta';
import { IBiblePhraseRef } from './models/IBibleReference.interface';

export const generateNormalizedRefId = (reference: IBiblePhraseRef, zeroFillToEnd = true) => {
    let refId = pad(getBookGenericIdFromOsisId(reference.bookOsisId), 2);
    if (reference.normalizedChapterNum) refId += '' + pad(reference.normalizedChapterNum, 3);
    else if (zeroFillToEnd) refId += '000';
    if (reference.normalizedVerseNum) refId += '' + pad(reference.normalizedVerseNum, 3);
    else if (zeroFillToEnd) refId += '000';
    if (reference.versionId) refId += '' + pad(reference.versionId, 3);
    else if (zeroFillToEnd) refId += '000';
    if (reference.phraseNum) refId += '' + pad(reference.phraseNum, 2);
    else if (zeroFillToEnd) refId += '00';
    return +refId;
};

export const generatePhraseId = (reference: Required<IBiblePhraseRef>) =>
    generateNormalizedRefId(reference);

export function pad(n: number, width: number, z?: string) {
    z = z || '0';
    let nStr = n + '';
    return nStr.length >= width ? nStr : new Array(width - nStr.length + 1).join(z) + n;
}

export const parsePhraseId = (id: number) => {
    const ret: Partial<IBiblePhraseRef> = {};
    let _id = id;
    ret.phraseNum = _id % 100;
    _id -= ret.phraseNum;
    _id /= 100;
    ret.versionId = _id;
    _id -= ret.versionId;
    _id /= 1000;
    ret.normalizedVerseNum = _id % 1000;
    _id -= ret.normalizedVerseNum;
    _id /= 1000;
    ret.normalizedChapterNum = _id % 1000;
    _id -= ret.normalizedChapterNum;
    _id /= 1000;
    const normalizedBookNum = _id;
    ret.bookOsisId = getOsisIdFromBookGenericId(normalizedBookNum);
    return <IBiblePhraseRef>ret;
};
