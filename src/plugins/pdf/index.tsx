import React, { useState, useEffect, useRef } from "react";
import * as pdfjs from "pdfjs-dist";
import { usePdf } from "./viewer";
import { default as Toolbar } from "./toolbar";
import { _download, _getObjectUrl, basename } from "../../utils";
import { useTranslation } from "react-i18next";
import {
    PDFViewerProps,
    ViewerPluginProps,
    PDFToolbarElement,
} from "../../definitions.js";

const MAX_SCALE = 4;
const MIN_SCALE = 0.5;
const SCALE_STEP = 0.1;
const FILE_LIMIT = 1024 * 1024 * 50;
const DEFAULT_SIZE = 1;

/**
 * Returns pdf object URL
 *
 * @export
 * @async
 * @param {*} url
 * @param {*} pdfDocument
 * @returns {unknown}
 */
const _getBlobUrl = async (url: string, pdfDocument: any) => {
    if (url.indexOf("blob:") == 0) {
        return url;
    }
    let unit8ArrayData = await pdfDocument.getData();
    let blob = new Blob([unit8ArrayData], { type: "application/pdf" });
    return _getObjectUrl(blob);
}

/**
 * PDF Viewer
 */
export default (props: ViewerPluginProps) => {
    const {
        fileBuffer,
        fileType,
        filesTotal,
        activeFile,
        activeIndex,
        pdfWorkerUrl,
        changeHandler,
        showFileName,
        allowDownloadFile = true,
        showLoader = (b) => {},
        showError = (b) => {},
        setOnHideError,
        errorMessage = (m) => {},
        // setFileOpen = () => {},
    } = props;

    const [inputFile, setInputFile] = useState(fileBuffer);
    const [page, setPage] = useState(1);
    const [scale, setScale] = useState(1);
    const [rotate, setRotate] = useState(0);
    const [fileName, setFileName] = useState<string>('');
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const pageWrapperRef = useRef<HTMLElement>(null);
    const toolbarRef = useRef<PDFToolbarElement>(null);
    const [pageScaleMap, setPageScaleMap] = useState({
        pageWidthScale: 1,
        pageHeightScale: 1,
        pageWidth: 0,
        pageHeight: 0,
    });
    const { t } = useTranslation();

    useEffect(() => {
        if (filesTotal != 0 && activeIndex < filesTotal) {
            setFileName(activeFile.name || basename(activeFile.src));
        }
    }, [fileBuffer]);

    const pdfConfigArr: PDFViewerProps = {
        file: inputFile,
        page: page,
        scale: scale,
        rotate: rotate,
        canvasRef: canvasRef,
        pageWrapperRef: pageWrapperRef,
        workerSrc: pdfWorkerUrl,
        cMapPacked: true,
        cMapUrl: location.origin + "/cmaps/",
        // cMapUrl: new URL(
        //     "/node_modules/pdfjs-dist/cmaps/",
        //     import.meta.url
        // ).toString() as string,
        onPageRenderSuccess: onPageRenderSuccess,
        onDocumentLoadFail: onDocumentLoadFail,
        onDocumentLoadSuccess: onDocumentLoadSuccess,
        onPageLoadFail: () => {},
        onPageLoadSuccess: () => {},
        onPageRenderFail: () => {},
        withCredentials: true,
    };
    const { pdfDocument, pdfPage } = usePdf(pdfConfigArr);

    useEffect(() => {
        showLoader(true);
        handleLayout();
    }, [pageScaleMap, scale]);

    useEffect(() => {
        // Page proportion data needs to be updated after rotation
        refreshScaleMap(pdfPage, rotate);
    }, [rotate]);

    function onDocumentLoadSuccess(pdfDocument: any) {
        showLoader(false);
        pdfDocument.getPage(1).then((pdfPage: any) => {
            // Initialize page proportion data
            refreshScaleMap(pdfPage);
        });
        // setFileOpen(true);
    }

    function onDocumentLoadFail(info: any) {
        showLoader(false);
        onShowError(true, info.message);
    }

    function onPageRenderSuccess(pdfPage: any) {
        showLoader(false);
    }

    const onPageSearch = (value: number) => {
        setPage(value);
    };

    const onZoomSearch = (value: string) => {
        const { pageWidthScale, pageHeightScale, pageWidth, pageHeight } =
            pageScaleMap;

        let scale = parseFloat(value);
        if (scale > 0) {
            setScale(scale);
            return;
        }

        switch (value) {
            case "page-actual":
                scale = DEFAULT_SIZE;
                break;
            case "page-fit":
                scale = Math.min(pageWidthScale, pageHeightScale);
                break;
            case "page-width":
                scale = pageWidthScale;
                break;
            case "auto":
                let isLandscape = pageWidth > pageHeight;
                let horizontalScale = isLandscape
                    ? Math.min(pageHeightScale, pageWidthScale)
                    : pageWidthScale;
                scale = Math.min(MAX_SCALE, horizontalScale);
                break;
            default:
                console.error(
                    'PDFViewer._setScale: "' +
                        value +
                        '" is an unknown zoom value.'
                );
                return;
        }
        setScale(scale);
    };

    const onRotateChange = (isClock: boolean) => {
        if (isClock) {
            setRotate(rotate + 90);
        } else {
            setRotate(rotate - 90);
        }
    };

    // Update initial scale data
    const refreshScaleMap = (
        pdfPage: pdfjs.PDFPageProxy | undefined,
        rotate = 0
    ) => {
        if (!pdfPage) return;
        if (!containerRef.current) return;
        let pageView = pdfPage._pageInfo.view;
        let pageWidth = pageView[2];
        let pageHeight = pageView[3];
        let rotation = rotate % 360;
        if (rotation == 90 || rotation == 270) {
            pageWidth = pageView[3];
            pageHeight = pageView[2];
        }
        let container = containerRef.current;
        let pageWidthScale =
            Math.round((container.clientWidth / pageWidth) * 10) / 10;
        let pageHeightScale =
            Math.round((container.clientHeight / pageHeight) * 10) / 10;
        setPageScaleMap({
            pageWidthScale,
            pageHeightScale,
            pageWidth,
            pageHeight,
        });
    };

    // Adjust to center or left according to page ratio
    const handleLayout = () => {
        const { pageWidthScale } = pageScaleMap;
        if (!containerRef.current) return;
        const isCenter = window.getComputedStyle(
            containerRef.current,
            null
        ).alignItems;

        if (scale >= pageWidthScale) {
            if (isCenter === "center") {
                containerRef.current.style.alignItems = "flex-start";
            }
        } else {
            if (isCenter !== "center") {
                containerRef.current.style.alignItems = "center";
            }
        }

        showLoader(false);
    };

    const onDownloadFile = async () => {
        showLoader(true);
        let fileUrl = await _getBlobUrl(activeFile.src, pdfDocument);
        _download(fileUrl, fileName, "pdf");
        showLoader(false);
    };

    const onShowError = (status: boolean = false, info: string = "") => {
        showError(status);
        if (info !== "") {
            info = t("pdfGenericError");
        }
        errorMessage(info);
    };

    return (
        <div className='pdf-document'>
            {fileName && showFileName && (
                <div className='file-name'>{`${fileName}`}</div>
            )}
            <>
                <Toolbar
                    ref={toolbarRef}
                    pdfDocument={pdfDocument}
                    pdfPage={pdfPage}
                    onPageSearch={onPageSearch}
                    onZoomSearch={onZoomSearch}
                    onRotateChange={onRotateChange}
                    pageOut={page}
                    scaleOut={scale}
                    MAX_SCALE={MAX_SCALE}
                    MIN_SCALE={MIN_SCALE}
                    SCALE_STEP={SCALE_STEP}
                    FILE_LIMIT={FILE_LIMIT}
                    // onShowError={onShowError}
                    // onUploadFile={onUploadFile}
                    onDownloadFile={onDownloadFile}
                    showLoader={showLoader}
                    downloadVisible={allowDownloadFile}
                    showError={showError}
                    setOnHideError={setOnHideError}
                    errorMessage={errorMessage}
                />
                <div
                    className='viewer-container'
                    ref={containerRef}
                    style={
                        {
                            "--scale-factor": scale,
                        } as React.CSSProperties
                    }
                >
                    {pdfDocument && (
                        <article className='page' ref={pageWrapperRef}>
                            <div className='canvas-wrapper'>
                                <canvas ref={canvasRef}></canvas>
                            </div>
                        </article>
                    )}
                </div>
            </>
        </div>
    );
};
