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

import { FileType } from "./definitions";

/**
 * This file contains sources of two projects:
 *      - https://github.com/react-office-viewer/getFileTypeFromArrayBuffer
 *      - https://github.com/react-office-viewer/react-office-viewer
 *
 *  Both are under the MIT License:
 *
 *  Copyright (c) 2023 react-office-viewer
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the 'Software'), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in all
 *  copies or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 *  SOFTWARE.
 *
 */

/**
 * Description placeholder
 *
 * @type {{}}
 */
// export enum KnownFileTypes {
//     XLSX = 'xlsx',
//     DOCX = 'docx',
//     PPTX = 'pptx',
//     EPUB = 'epub',
//     FB2 = 'fb2',
//     PDF = 'pdf',
//     XLS = 'xls',
//     DOC = 'doc',
//     PPT = 'ppt',
//     FILE2003 = 'file2003',
//     FILE2007 = 'file2007',
//     IMAGE = 'image',
//     OTHER = 'other',
// }

// See: https://en.wikipedia.org/wiki/List_of_file_signatures
const formatMap: { [key: string]: string[][] } = {
    pdf: [['25', '50', '44', '46']],
    file2003: [['d0', 'cf', '11', 'e0']],
    file2007: [
        ['50', '4b', '03', '04'],
        ['50', '4b', '05', '06'],
        ['50', '4b', '07', '08'],
    ],
    png: [['89', '50', '4e', '47']],
    gif: [
        ['47', '49', '46', '38', '37', '61'],
        ['47', '49', '46', '38', '39', '61'],
    ],
    jpg: [
        ['ff', 'd8', 'ff', 'e0'],
        ['ff', 'd8', 'ff', 'e1'],
        ['ff', 'd8', 'ff', 'ee'],
        ['ff', 'd8', 'ff', 'e8'],
    ],
    tiff: [
        ['49', '49', '2a', '00'],
        ['4d', '4d', '00', '2a'],
    ],
    webp: [['52', '49', '46', '46']],
    bmp: [['42', '4D']],
};

// xls is determined by the the file header, and the other two by its tail
// const pptFormatList = [
//     '50',
//     '6f',
//     '77',
//     '65',
//     '72',
//     '50',
//     '6f',
//     '69',
//     '6e',
//     '74',
//     '20',
//     '44',
//     '6f',
//     '63',
//     '75',
//     '6d',
//     '65',
//     '6e',
//     '74',
// ];

// const format2003Map: Record<string, string[]> = {
//     xls: ['4d', '69', '63', '72', '6f', '73', '6f', '66', '74', '20', '45', '78', '63', '65', '6c'],
//     doc: ['4d', '69', '63', '72', '6f', '73', '6f', '66', '74', '20', '57', '6f', '72', '64'],
//     ppt: [
//         '50',
//         '00',
//         '6f',
//         '00',
//         '77',
//         '00',
//         '65',
//         '00',
//         '72',
//         '00',
//         '50',
//         '00',
//         '6f',
//         '00',
//         '69',
//         '00',
//         '6e',
//         '00',
//         '74',
//         '00',
//         '20',
//         '00',
//         '44',
//         '00',
//         '6f',
//         '00',
//         '63',
//         '00',
//         '75',
//         '00',
//         '6d',
//         '00',
//         '65',
//         '00',
//         '6e',
//         '00',
//         '74',
//     ],
// };
// Decision made by searching keywords at the end of each file
// const format2007Map: Record<string, string[]> = {
//     xlsx: ['77', '6f', '72', '6b', '73', '68', '65', '65', '74', '73', '2f'], // worksheets
//     docx: ['77', '6f', '72', '64', '2f'], // word
//     pptx: ['70', '70', '74', '2f'], // ppt
// };

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
    'image/svg+xml': 'svg',
};

/**
 * Swap key/value pair in `Obj`
 *
 * @param {*} obj
 * @returns {*}
 */
export const swapKeyValue = (obj: Object): Object => {
    return Object.fromEntries(Object.entries(obj).map((a) => a.reverse()));
};

export const getfileTypeExtesions = (fileExt: string | null = null): string[] | boolean => {
    const exts = Object.values(fileTypeMap);
    if (!fileExt) return exts;
    else if (exts.includes(fileExt)) return true;
    return false;
}

export const getfileTypes = () => {
    return Object.keys(fileTypeMap);
}

/**
 * Description placeholder
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
 * Description placeholder
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
 * Description placeholder
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
 * Description placeholder
 *
 * @export
 * @param {*} fileName
 * @returns {*}
 */
// export function getFileExtension(fileName: any): string {
//     const ext = fileName.slice(((fileName.lastIndexOf('.') - 1) >>> 0) + 2).toLowerCase();
//     if (Object.values(KnownFileTypes).includes(ext)) {
//         return ext;
//     }
//     return 'other';
// }

/**
 * Description placeholder
 *
 * @export
 * @param {*} type
 * @returns {*}
 */
// export function getFileTypeFromUploadType(type: string): string {
//     return fileTypeMap[type] || 'other';
// }

export function getFileType(arrayBuffer: Uint8Array, fileName: string, mimeType: string): FileType {
    const fType: FileType = {
        extension: fileName ? fileName.slice(((fileName.lastIndexOf('.') - 1) >>> 0) + 2).toLowerCase() : '',
        simpleType: '',
        contentType: '',
        isZip: false,
        mimeType: mimeType,
    }

    try {
        // if (Object.prototype.toString.call(arrayBuffer) !== '[object ArrayBuffer]') {
        //     throw new TypeError('(!) the provided value is not a valid ArrayBuffer type.');
        // }
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
        if(arrayBuffer[0] === 0x50 && arrayBuffer[1] === 0x4b && arrayBuffer[2] === 0x03 && arrayBuffer[3] === 0x04) {
            fType.isZip = true;
        }

        if (fType.contentType == '') {
            // emit debug data
            console.log(`(!) unable to identiify the file (${fType.contentType}) type using byte mask:`, str_8);
            // No match, it may be an xls file in html format
            let arr_start_16 = getSliceArrTo16(arrayBuffer, 50, 150);
            let xlsHtmlTarget = ['6f', '66', '66', '69', '63', '65', '3a', '65', '78', '63', '65', '6c'];
            // Determine whether it is xls through the first 50-150 positions
            if (~arr_start_16.join('').indexOf(xlsHtmlTarget.join(''))) {
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
        } else if (fType.contentType == 'file2007') {
            // fix for EPUB
            if (mimeType == fileTypesReverse['epub']) {
                fType.contentType = 'epub';
                fType.simpleType = 'ebook';
            } else {
                // The default is one of the three formats: xlsx, pptx, docx, for the second match.
                // If no match is found, the result is still file2007
                // let arr_500_16 = getSliceArrTo16(arrayBuffer, -500, 0);
                // for (let type in format2007Map) {
                //     let target = format2007Map[type];
                //     if (isListContainsTarget(target, arr_500_16)) {
                //         fType.simpleType = type;
                //         break;
                //     }
                // }
                fType.simpleType = fType.extension;
            }
        } else if (fType.contentType == 'pdf') {
            fType.simpleType = 'pdf';
        } else if (fType.contentType == 'file2003') {
            // let arr_end_16 = getSliceArrTo16(arrayBuffer, -550, -440);
            // for (let type in format2003Map) {
            //     let target = format2003Map[type];
            //     // Determine whether it is doc/ppt by counting down the 440-550 position
            //     if (~arr_end_16.join('').indexOf(target.join(''))) {
            //         fType.simpleType = type;
            //         break;
            //     }
            // }
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
    return Array.prototype.map.call(newArr, (x) => ('00' + x.toString(16)).slice(-2)) as string[];
}
