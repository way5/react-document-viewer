import { DownloadFileProps } from '../definitions';

/**
 * FIle dowwnloader
 *
 * Keep in mind that the request is asynchronous,
 * so plugin has to wait for the request to be completed
 *
 * @param props
 */
export default function DownloadFile(props: DownloadFileProps) {
    const { files, activeIndex, downloadTimeout, onLoad = () => {}, onLoadend = () => {}, onAbort, onError } = props;

    let activeFile = files[0];
    if (files.length > 0 && activeIndex < files.length) {
        activeFile = files[activeIndex];
    }

    const req = new XMLHttpRequest();
    req.open('GET', activeFile.src);
    req.responseType = 'blob';

    const xhrTimeOut = setTimeout(() => {
        req.abort();
    }, downloadTimeout);

    try {
        req.onload = function (e: ProgressEvent) {
            clearTimeout(xhrTimeOut);
            onLoad(e);
        };
        req.onloadend = function (e: ProgressEvent) {
            if (req.response) {
                const t = async () => {
                    let buffer = await req.response.arrayBuffer();
                    const arrBuffer = new Uint8Array(buffer);
                    onLoadend(
                        arrBuffer,
                        activeFile.src.substring(activeFile.src.lastIndexOf('/') + 1),
                        req.response.type,
                        e
                    );
                };
                t();
                // TODO Blob.size
            } else {
                console.error(`empty response received while downloading: ${activeFile.src}`);
            }
        };
        req.onerror = function (e: ProgressEvent) {
            onError && onError(e);
        };
        req.onabort = (e: ProgressEvent) => onAbort && onAbort(e);
        req.send();
    } catch (e) {
        console.error(`unable to download: ${files[activeIndex]}`);
    }
}
