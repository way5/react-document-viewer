/*
 File: utils.jsx
 File Created: Tuesday, 13th August 2024 4:50:30 pm
 Author: Sergey Ko
 Last Modified: Saturday, 17th August 2024 8:10:42 pm
 Modified By: Sergey Ko
 License: MIT
 ---------------------------------------------------------------------------------
 CHANGELOG:
 ---------------------------------------------------------------------------------
*/

import { FileType } from './definitions';

// See: https://en.wikipedia.org/wiki/List_of_file_signatures
const formatMap: { [key: string]: string[][] } = {
    pdf: [['25', '50', '44', '46']],
    file2003: [['d0', 'cf', '11', 'e0']],
    file2007: [
        ['50', '4b', '03', '04'],
        ['50', '4b', '05', '06'],
        ['50', '4b', '07', '08']
    ],
    png: [['89', '50', '4e', '47']],
    gif: [
        ['47', '49', '46', '38', '37', '61'],
        ['47', '49', '46', '38', '39', '61']
    ],
    jpg: [
        ['ff', 'd8', 'ff', 'e0'],
        ['ff', 'd8', 'ff', 'e1'],
        ['ff', 'd8', 'ff', 'ee'],
        ['ff', 'd8', 'ff', 'e8']
    ],
    tiff: [
        ['49', '49', '2a', '00'],
        ['4d', '4d', '00', '2a']
    ],
    webp: [['52', '49', '46', '46']],
    bmp: [['42', '4D']]
};

// See: https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types
// Also: https://svn.apache.org/repos/asf/httpd/httpd/trunk/docs/conf/mime.types
const fileTypeMap: { [key: string]: string } = {
    'application/pdf': 'pdf',
    'application/vnd.ms-excel': 'xls',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
    'application/msword': 'doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
    'application/vnd.ms-powerpoint': 'ppt',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
    'application/epub+zip': 'epub',
    'application/vnd.comicbook+zip': 'cbz',
    'application/x-fictionbook+xml': 'fb2',
    'application/x-zip-compressed-fb2': 'fbz',
    'application/x-mobipocket-ebook': 'mobi',
    'text/plain': 'txt',
    'text/xml': 'xml',
    'image/avif': 'avif',
    'image/bmp': 'bmp',
    'image/gif': 'gif',
    'image/vnd.microsoft.icon': 'ico',
    'image/jpeg': 'jpg',
    'image/apng': 'png',
    'image/png': 'png',
    'image/svg': 'svg',
    'image/tiff': 'tiff',
    'image/webp': 'webp',
    'image/x-icon': 'ico',
    'image/x-ms-bmp': 'bmp',
    'image/x-png': 'png',
    'image/x-ico': 'ico',
    'image/x-tiff': 'tiff',
    'image/x-webp': 'webp',
    'image/x-bmp': 'bmp',
    'image/svg+xml': 'svg'
};

/**
 * Swap key/value pair in `Obj`
 *
 * @param {*} obj
 * @returns {*}
 */
export const swapKeyValue = (obj: Object): Object => {
    return Object.fromEntries(Object.entries(obj).map(a => a.reverse()));
};

/**
 * Get file type extensions
 *
 * @param {(string | null)} [fileExt=null]
 * @returns {(string[] | boolean)}
 */
export const getfileTypeExtesions = (fileExt: string | null = null): string[] | boolean => {
    const exts = Object.values(fileTypeMap);
    if (!fileExt) return exts;
    else if (exts.includes(fileExt)) return true;
    return false;
};

/**
 * Get file types
 *
 * @returns {*}
 */
export const getfileTypes = (): string[] => {
    return Object.keys(fileTypeMap);
};

/**
 * Returns file name extracted from path
 *
 * @type {*}
 */
export const basename = (path: string): string => {
    return path.replace(/^.*[\\/]/, '');
};

/**
 * Get blob URL
 *
 * @export
 * @param {*} arrayBuffer
 * @param {*} fileType
 * @returns {*}
 */
export function _getBlobUrlFromBuffer(arrayBuffer: Uint8Array | null, fileType: string): string {
    if (!arrayBuffer) return '';
    const fileTypesReverse: any = swapKeyValue(fileTypeMap);
    const type = fileTypesReverse[fileType] || fileTypesReverse['txt'];
    const blob = new Blob([arrayBuffer], { type });
    return _getObjectUrl(blob);
}

/**
 * Get object URL
 *
 * @export
 * @param {*} file
 * @returns {*}
 */
export function _getObjectUrl(file: any): string {
    let url = null;
    if (window.createObjectURL !== undefined) {
        // basic
        url = window.createObjectURL(file);
    } else if (window.webkitURL !== undefined) {
        // webkit or chrome
        url = window.webkitURL.createObjectURL(file);
    } else if (window.URL !== undefined) {
        // mozilla(firefox)
        url = window.URL.createObjectURL(file);
    }
    return url;
}

/**
 * Download an object (blob)
 *
 * @export
 * @param {*} blobUrl
 * @param {*} fileName
 * @param {string} [ext='txt']
 */
export function _download(blobUrl: string, fileName: string, ext: string = 'txt') {
    var a = document.createElement('a');
    let _fileName = fileName || new Date().toLocaleDateString() + `.${ext}`;
    if (a.click) {
        a.href = blobUrl;
        a.target = '_parent';
        if ('download' in a) {
            a.download = _fileName;
        }
        (document.body || document.documentElement).appendChild(a);
        a.click();
        a.parentNode?.removeChild(a);
    } else {
        if (window.top === window && blobUrl.split('#')[0] === window.location.href.split('#')[0]) {
            var padCharacter = blobUrl.indexOf('?') === -1 ? '?' : '&';
            blobUrl = blobUrl.replace(/#|$/, padCharacter + '$&');
        }
        window.open(blobUrl, '_parent');
    }
}

/**
 * Get file type
 *
 * @export
 * @param {Uint8Array} arrayBuffer
 * @param {string} fileName
 * @param {string} mimeType
 * @returns {FileType}
 */
export function getFileType(arrayBuffer: Uint8Array, fileName: string, mimeType: string): FileType {
    const fType: FileType = {
        extension: fileName ? fileName.slice(((fileName.lastIndexOf('.') - 1) >>> 0) + 2).toLowerCase() : '',
        simpleType: '',
        contentType: '',
        isZip: false,
        mimeType: mimeType
    };

    try {
        const str_8 = getSliceArrTo16(arrayBuffer, 0, 8).join('');
        // first match
        for (let key in formatMap) {
            formatMap[key].forEach((type: string[]) => {
                let target = type.join('');
                if (~str_8.indexOf(target)) {
                    fType.contentType = key;
                }
            });
        }

        const fileTypesReverse: any = swapKeyValue(fileTypeMap);

        // check if isZip
        if (arrayBuffer[0] === 0x50 && arrayBuffer[1] === 0x4b && arrayBuffer[2] === 0x03 && arrayBuffer[3] === 0x04) {
            fType.isZip = true;
        }

        if (fType.contentType == '') {
            // emit debug data
            console.log(`(!) header [${str_8}] has not been identified, trying something else...`);
            // No match, it may be an xls file in html format
            let arr_start_16 = getSliceArrTo16(arrayBuffer, 50, 150).join('');
            let xlsHtmlTarget = ['6f', '66', '66', '69', '63', '65', '3a', '65', '78', '63', '65', '6c'];
            // Determine whether it is xls through the first 50-150 positions
            if (~arr_start_16.indexOf(xlsHtmlTarget.join(''))) {
                fType.simpleType = 'xls';
            } else if (mimeType == fileTypesReverse['fb2'] || fType.extension === 'fb2' || fType.extension === 'fbz') {
                // this is FB2 maybe
                fType.contentType = 'fb2';
                fType.simpleType = 'ebook';
            } else if (mimeType == fileTypesReverse['mobi'] || fType.extension === 'mobi') {
                // looks like a kindle ebook
                fType.contentType = 'mobi';
                fType.simpleType = 'ebook';
            }
            // still nothing
            if (fType.contentType == '')
                throw new Error(`(!) still unable to identiify the file type with header: ${arr_start_16}`);
        } else if (fType.contentType == 'file2007') {
            // fix for EPUB
            if (mimeType == fileTypesReverse['epub']) {
                fType.contentType = 'epub';
                fType.simpleType = 'ebook';
            } else {
                fType.simpleType = fType.extension;
            }
        } else if (fType.contentType == 'pdf') {
            fType.simpleType = 'pdf';
        } else if (fType.contentType == 'file2003') {
            fType.simpleType = fType.extension;
        } else if (
            fType.contentType == 'avif' ||
            fType.contentType == 'bmp' ||
            fType.contentType == 'gif' ||
            fType.contentType == 'ico' ||
            fType.contentType == 'jpg' ||
            fType.contentType == 'png' ||
            // result == 'svg' ||
            fType.contentType == 'tiff' ||
            fType.contentType == 'webp'
        ) {
            fType.simpleType = 'image';
        }
    } catch (e) {
        console.log(e);
    }

    // console.log('getFileType', fileName, mimeType, fType);
    return fType;
}

/**
 * Whether the arr array contains the target array
 *
 * @export
 * @param {*} target
 * @param {*} arr
 * @returns {boolean}
 */
export function isListContainsTarget(target: string[], arr: string[]) {
    let i = 0;
    while (i < arr.length) {
        if (arr[i] == target[0]) {
            let temp = arr.slice(i, i + target.length);
            if (temp.join() === target.join()) {
                return true;
            }
        }
        i++;
    }
}

/**
 * Intercept part of the array and convert it into hexadecimal
 *
 * @export
 * @param {*} arr
 * @param {*} start
 * @param {*} end
 * @returns {*}
 */
export function getSliceArrTo16(arr: Uint8Array, start: number, end: number): string[] {
    let newArr = arr.slice(start, end);
    return Array.prototype.map.call(newArr, x => ('00' + x.toString(16)).slice(-2)) as string[];
}
