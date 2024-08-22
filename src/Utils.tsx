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
export enum KnownFileTypes {
    XLSX = "xlsx",
    DOCX = "docx",
    PPTX = "pptx",
    PDF = "pdf",
    XLS = "xls",
    DOC = "doc",
    PPT = "ppt",
    FILE2003 = "file2003",
    FILE2007 = "file2007",
    IMAGE = "image",
    OTHER = "other",
}

// See: https://en.wikipedia.org/wiki/List_of_file_signatures
const formatMap = {
    pdf: [["25", "50", "44", "46"]],
    file2003: [["d0", "cf", "11", "e0"]],
    file2007: [
        ["50", "4b", "03", "04"],
        ["50", "4b", "05", "06"],
        ["50", "4b", "07", "08"],
    ],
    png: [["89", "50", "4e", "47"]],
    gif: [
        ["47", "49", "46", "38", "37", "61"],
        ["47", "49", "46", "38", "39", "61"],
    ],
    jpg: [
        ["ff", "d8", "ff", "e0"],
        ["ff", "d8", "ff", "e1"],
        ["ff", "d8", "ff", "ee"],
        ["ff", "d8", "ff", "e8"],
    ],
    tiff: [
        ["49", "49", "2a", "00"],
        ["4d", "4d", "00", "2a"],
    ],
    webp: [["52", "49", "46", "46"]],
    bmp: [["42", "4D"]],
};

// Decision made by searching keywords at the end of each file
const format2007Map = {
    xlsx: ["77", "6f", "72", "6b", "73", "68", "65", "65", "74", "73", "2f"], // worksheets
    docx: ["77", "6f", "72", "64", "2f"], // word
    pptx: ["70", "70", "74", "2f"], // ppt
};

// xls is determined by the the file header, and the other two by its tail
const pptFormatList = [
    "50",
    "6f",
    "77",
    "65",
    "72",
    "50",
    "6f",
    "69",
    "6e",
    "74",
    "20",
    "44",
    "6f",
    "63",
    "75",
    "6d",
    "65",
    "6e",
    "74",
];

const format2003Map = {
    xls: [
        "4d",
        "69",
        "63",
        "72",
        "6f",
        "73",
        "6f",
        "66",
        "74",
        "20",
        "45",
        "78",
        "63",
        "65",
        "6c",
    ],
    doc: [
        "4d",
        "69",
        "63",
        "72",
        "6f",
        "73",
        "6f",
        "66",
        "74",
        "20",
        "57",
        "6f",
        "72",
        "64",
    ],
    ppt: pptFormatList.join(",00,").split(","),
};

// See: https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types
const fileTypeMap = {
    "application/pdf": "pdf",
    "application/vnd.ms-excel": "xls",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
    "application/msword": "doc",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        "docx",
    "application/vnd.ms-powerpoint": "ppt",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation":
        "pptx",
    "application/epub+zip": "epub",
    "text/plain": "default",
    "image/avif": "avif",
    "image/bmp": "bmp",
    "image/gif": "gif",
    "image/vnd.microsoft.icon": "ico",
    "image/jpeg": "jpg",
    "image/apng": "png",
    "image/png": "png",
    "image/svg": "svg",
    "image/tiff": "tiff",
    "image/webp": "webp",
    "image/x-icon": "ico",
    "image/x-ms-bmp": "bmp",
    "image/x-png": "png",
    "image/x-ico": "ico",
    "image/x-tiff": "tiff",
    "image/x-webp": "webp",
    "image/x-bmp": "bmp",
    "image/svg+xml": "svg",
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

/**
 * Description placeholder
 *
 * @export
 * @async
 * @param {*} url
 * @param {*} pdfDocument
 * @returns {unknown}
 */
export async function _getBlobUrl(url: string, pdfDocument: any) {
    if (url.indexOf("blob:") == 0) {
        return url;
    }
    let unit8ArrayData = await pdfDocument.getData();
    let blob = new Blob([unit8ArrayData], { type: "application/pdf" });
    return _getObjectUrl(blob);
}

/**
 * Description placeholder
 *
 * @export
 * @param {*} arrayBuffer
 * @param {*} fileType
 * @returns {*}
 */
export function _getBlobUrlFromBuffer(
    arrayBuffer: Uint8Array | null,
    fileType: string
): string {
    if (!arrayBuffer) return "";
    const fileTypesReverse: any = swapKeyValue(fileTypeMap);
    const type = fileTypesReverse[fileType] || fileTypesReverse["default"];
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
    if (window.createObjectURL != undefined) {
        // basic
        url = window.createObjectURL(file);
    } else if (window.webkitURL != undefined) {
        // webkit or chrome
        url = window.webkitURL.createObjectURL(file);
    } else if (window.URL != undefined) {
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
export function _download(
    blobUrl: string,
    fileName: string,
    ext: string = "txt"
) {
    var a = document.createElement("a");
    let _fileName = fileName || new Date().toLocaleDateString() + `.${ext}`;
    if (a.click) {
        a.href = blobUrl;
        a.target = "_parent";
        if ("download" in a) {
            a.download = _fileName;
        }
        (document.body || document.documentElement).appendChild(a);
        a.click();
        a.parentNode.removeChild(a);
    } else {
        if (
            window.top === window &&
            blobUrl.split("#")[0] === window.location.href.split("#")[0]
        ) {
            var padCharacter = blobUrl.indexOf("?") === -1 ? "?" : "&";
            blobUrl = blobUrl.replace(/#|$/, padCharacter + "$&");
        }
        window.open(blobUrl, "_parent");
    }
}

/**
 * Description placeholder
 *
 * @export
 * @param {*} fileName
 * @returns {*}
 */
export function getFileTypeFromFileName(fileName: any): string {
    const ext = fileName
        .slice(((fileName.lastIndexOf(".") - 1) >>> 0) + 2)
        .toLowerCase();
    if (Object.values(KnownFileTypes).includes(ext)) {
        return ext;
    }
    return "other";
}

/**
 * Description placeholder
 *
 * @export
 * @param {*} type
 * @returns {*}
 */
export function getFileTypeFromUploadType(type: string): string {
    return fileTypeMap[type] || "other";
}

/**
 * Description placeholder
 *
 * @export
 * @param {*} arrayBuffer
 * @returns {string}
 */
export function getFileTypeFromArrayBuffer(
    arrayBuffer: any,
    ext: string | null
) {
    try {
        if (
            Object.prototype.toString.call(arrayBuffer) !==
            "[object ArrayBuffer]"
        ) {
            throw new TypeError(
                "The provided value is not a valid ArrayBuffer type."
            );
        }
        const arr = new Uint8Array(arrayBuffer);
        const str_8 = getSliceArrTo16(arr, 0, 8).join("");
        // Convert the data into hexadecimal and compare it with the modulus
        // of each format for the first match.Only the first eight digits of
        // the arrayBuffer are matched to obtain a wide range of fuzzy types.
        let result = undefined;
        // display warning message if identification algorithm has failed
        const consoleWarning = (result: string, arr: any) => {
            console.log(
                `(!) unable to identiify the file (${result}) type using byte mask... now rely on file extension`,
                arr
            );
        };
        // first match
        for (let key in formatMap) {
            formatMap[key].forEach((type: string[]) => {
                let target = type.join("");
                if (~str_8.indexOf(target)) {
                    // equal to (str_8.indexOf(target) !== '-1')
                    result = key;
                    return;
                }
            });
        }

        if (!result) {
            // emit debug data
            console.log(
                `(!) unable to identiify the file (${result}) type using byte mask:`,
                str_8
            );
            // No match, it may be an xls file in html format
            let arr_start_16 = getSliceArrTo16(arr, 50, 150);
            let xlsHtmlTarget = [
                "6f",
                "66",
                "66",
                "69",
                "63",
                "65",
                "3a",
                "65",
                "78",
                "63",
                "65",
                "6c",
            ];
            // Determine whether it is xls through the first 50-150 positions
            if (~arr_start_16.join("").indexOf(xlsHtmlTarget.join(""))) {
                return "xls";
            }
            return "other";
        } else if (result == "pdf") {
            return result;
        } else if (result == "file2007") {
            // The default is one of the three formats: xlsx, pptx, docx, for the second match.
            // If no match is found, the result is still file2007
            let arr_500_16 = getSliceArrTo16(arr, -500, 0);
            for (let type in format2007Map) {
                let target = format2007Map[type];
                if (isListContainsTarget(target, arr_500_16)) {
                    result = type;
                    break;
                }
            }
            // if we are unable to find match, rely on extension
            if (result == "file2007" && ext != null) {
                consoleWarning(result, arr_500_16);
                switch (ext) {
                    case "docx":
                        return "docx";
                    case "xlsx":
                        return "xlsx";
                    case "pptx":
                        return "pptx";
                    default:
                        break;
                }
            }
            return result;
        } else if (result == "file2003") {
            let arr_end_16 = getSliceArrTo16(arr, -550, -440);
            for (let type in format2003Map) {
                let target = format2003Map[type];
                // Determine whether it is doc/ppt by counting down the 440-550 position
                if (~arr_end_16.join("").indexOf(target.join(""))) {
                    result = type;
                    break;
                }
            }
            // if we are unable to find match, rely on extension
            if (result == "file2003" && ext != null) {
                consoleWarning(result, arr_end_16);
                switch (ext) {
                    case "doc":
                        return "doc";
                    case "xls":
                        return "xls";
                    case "ppt":
                        return "ppt";
                    default:
                        break;
                }
            }
            return result;
        } else if (
            result == "avif" ||
            result == "bmp" ||
            result == "gif" ||
            result == "ico" ||
            result == "jpg" ||
            result == "png" ||
            // result == 'svg' ||
            result == "tiff" ||
            result == "webp"
        ) {
            return "image";
        }
        // no match
        return "other";
    } catch (e) {
        console.log(e);
    }
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
export function getSliceArrTo16(arr: any, start: number, end: number) {
    let newArr = arr.slice(start, end);
    return Array.prototype.map.call(newArr, (x) =>
        ("00" + x.toString(16)).slice(-2)
    );
}
