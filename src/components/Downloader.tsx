import { DownloadFileProps } from "../Definitions";
import { getFileTypeFromArrayBuffer, getFileTypeFromFileName } from "../Utils";

/**
 * FIle dowwnloader
 *
 * Keep in mind that the request is asynchronous,
 * so plugin has to wait for the request to be completed
 *
 * @param props
 */
export default function DownloadFile(props: DownloadFileProps) {
    const {
        files,
        activeIndex,
        downloadTimeout,
        onLoad,
        onAbort,
        onError,
        fileIdentification,
    } = props;

    let activeFile = files[0];
    if (files.length > 0 && activeIndex < files.length) {
        activeFile = files[activeIndex];
    }

    const fileExtension = getFileTypeFromFileName(activeFile.src);
    const req = new XMLHttpRequest();
    req.open("GET", activeFile.src);
    req.responseType = "arraybuffer";

    const xhrTimeOut = setTimeout(() => {
        req.abort();
    }, downloadTimeout);

    try {
        req.onload = function (e: ProgressEvent) {
            clearTimeout(xhrTimeOut);
            const fileType = (
                fileIdentification === "extension"
                    ? fileExtension
                    : getFileTypeFromArrayBuffer(req.response, fileExtension)
            ) as string;
            const arrBuffer = new Uint8Array(req.response);
            onLoad(arrBuffer, fileType, e);
        };
        req.onerror = function (e: ProgressEvent) {
            onError && onError(e);
        };
        req.onabort = (e: ProgressEvent) => onAbort && onAbort(e);
        req.send();
    } catch (e) {
        console.log(`(!) unable to download: ${files[activeIndex]}`);
    }
}
