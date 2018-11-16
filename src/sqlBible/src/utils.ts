import { getBookGenericIdFromOsisId, getOsisIdFromBookGenericId } from './data/bibleMeta';
import { IBiblePhraseRef } from './models/IBibleReference.interface';

export const generateNormalizedRefId = (reference: IBiblePhraseRef, segments: number) => {
    let refId = pad(getBookGenericIdFromOsisId(reference.bookOsisId), 2);
    if (segments >= 2) {
        if (reference.normalizedChapterNum) refId += '' + pad(reference.normalizedChapterNum, 3);
        else refId += '000';
    }
    if (segments >= 3) {
        if (reference.normalizedVerseNum) refId += '' + pad(reference.normalizedVerseNum, 3);
        else refId += '000';
    }
    if (segments >= 4) {
        if (reference.versionId) refId += '' + pad(reference.versionId, 3);
        else refId += '000';
    }
    if (segments >= 5) {
        if (reference.phraseNum) refId += '' + pad(reference.phraseNum, 2);
        else refId += '00';
    }
    return +refId;
};

export const generatePhraseId = (reference: Required<IBiblePhraseRef>) =>
    generateNormalizedRefId(reference, 5);

export function pad(n: number, width: number, z?: string) {
    z = z || '0';
    let nStr = n + '';
    return nStr.length >= width ? nStr : new Array(width - nStr.length + 1).join(z) + n;
}

export const parsePhraseId = (id: number) => {
    const ret: Partial<IBiblePhraseRef> = {};
    let _id = id;

    if (id > 99999999999) {
        ret.phraseNum = _id % 100;
        _id -= ret.phraseNum;
        _id /= 100;
    }
    if (id > 99999999) {
        ret.versionId = _id % 1000;
        _id -= ret.versionId;
        _id /= 1000;
    }
    if (id > 99999) {
        ret.normalizedVerseNum = _id % 1000;
        _id -= ret.normalizedVerseNum;
        _id /= 1000;
    }
    if (id > 99) {
        ret.normalizedChapterNum = _id % 1000;
        _id -= ret.normalizedChapterNum;
        _id /= 1000;
    }
    const normalizedBookNum = _id;
    ret.bookOsisId = getOsisIdFromBookGenericId(normalizedBookNum);
    return <IBiblePhraseRef>ret;
};
