import { useState, useEffect, useRef } from 'react';
import * as pdfjs from 'pdfjs-dist';
import { RenderTask, TextContent } from 'pdfjs-dist/types/src/display/api';
import { PDFViewerProps } from '../../definitions';

/**
 * PDF viewer
 *
 * @param {PDFViewerProps} props
 * @returns {{ pdfDocument: any; pdfPage: any; }}
 */
export const usePdf = (props: PDFViewerProps) => {
    const {
        canvasRef,
        pageWrapperRef,
        file,
        onDocumentLoadSuccess,
        onDocumentLoadFail,
        onPageLoadSuccess,
        onPageLoadFail,
        onPageRenderSuccess,
        onPageRenderFail,
        scale = 1.5,
        rotate = 0,
        page = 1,
        cMapUrl,
        cMapPacked,
        workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.mjs`,
        withCredentials = true
    } = props;

    const [pdfDocument, setPdfDocument] = useState<pdfjs.PDFDocumentProxy>();
    const [pdfPage, setPdfPage] = useState<pdfjs.PDFPageProxy>();
    const renderTask = useRef<RenderTask | null>(null);
    const scaleRef = useRef(scale);
    const pdfPageRef = useRef(pdfPage);
    const onDocumentLoadSuccessRef = useRef(onDocumentLoadSuccess);
    const onDocumentLoadFailRef = useRef(onDocumentLoadFail);
    const onPageLoadSuccessRef = useRef(onPageLoadSuccess);
    const onPageLoadFailRef = useRef(onPageLoadFail);
    const onPageRenderSuccessRef = useRef(onPageRenderSuccess);
    const onPageRenderFailRef = useRef(onPageRenderFail);

    useEffect(() => {
        onDocumentLoadSuccessRef.current = onDocumentLoadSuccess;
    }, [onDocumentLoadSuccess]);

    useEffect(() => {
        onDocumentLoadFailRef.current = onDocumentLoadFail;
    }, [onDocumentLoadFail]);

    useEffect(() => {
        onPageLoadSuccessRef.current = onPageLoadSuccess;
    }, [onPageLoadSuccess]);

    useEffect(() => {
        onPageLoadFailRef.current = onPageLoadFail;
    }, [onPageLoadFail]);

    useEffect(() => {
        onPageRenderSuccessRef.current = onPageRenderSuccess;
    }, [onPageRenderSuccess]);

    useEffect(() => {
        onPageRenderFailRef.current = onPageRenderFail;
    }, [onPageRenderFail]);

    useEffect(() => {
        pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;
    }, [workerSrc]);

    useEffect(() => {
        scaleRef.current = scale;
    }, [scale]);

    useEffect(() => {
        pdfPageRef.current = pdfPage;
    }, [pdfPage]);

    useEffect(() => {
        if (typeof file !== 'object') {
            return;
        }
        // const config = { withCredentials };
        // if (isFunction(file)) {
        //     config.url = file();
        // }
        // else {
        //     config.url = file;
        // }
        // if (cMapUrl) {
        //     config.cMapUrl = cMapUrl;
        //     config.cMapPacked = cMapPacked;
        // }
        pdfjs.getDocument(file).promise.then(
            loadedPdfDocument => {
                setPdfDocument(loadedPdfDocument);

                if (typeof onDocumentLoadSuccessRef.current === 'function') {
                    onDocumentLoadSuccessRef.current(loadedPdfDocument);
                }
            },
            info => {
                if (typeof onDocumentLoadFailRef.current === 'function') {
                    onDocumentLoadFailRef.current(info);
                }
            }
        );
    }, [file, withCredentials, cMapUrl, cMapPacked]);

    useEffect(() => {
        if (pdfDocument) {
            pdfDocument.getPage(page).then(
                loadedPdfPage => {
                    setPdfPage(loadedPdfPage);
                    if (typeof onPageLoadSuccessRef.current === 'function') {
                        onPageLoadSuccessRef.current(loadedPdfPage);
                    }
                },
                e => {
                    console.log('(!) page load failed: ', e);
                    if (typeof onPageLoadFailRef.current === 'function') {
                        onPageLoadFailRef.current();
                    }
                }
            );
        }
    }, [canvasRef, pageWrapperRef, pdfDocument, page]);

    useEffect(() => {
        const drawPDF = (page: pdfjs.PDFPageProxy) => {
            // Because this page's rotation option overwrites pdf default rotation value,
            // calculating page rotation option value from pdf default and this component prop rotate.
            const rotation = rotate === 0 ? page.rotate : page.rotate + rotate;
            const dpRatio = 1.00071 || window.devicePixelRatio;

            const adjustedScale = scaleRef.current * dpRatio;
            const viewport = page.getViewport({
                scale: adjustedScale,
                rotation
            });
            const canvasEl = canvasRef.current;
            if (!canvasEl) {
                return;
            }
            const canvasContext = canvasEl.getContext('2d');
            if (!canvasContext) {
                return;
            }
            const pageWrapper: any = pageWrapperRef.current;
            pageWrapper.style.width = `${viewport.width / dpRatio}px`;
            pageWrapper.style.height = `${viewport.height / dpRatio}px`;
            canvasEl.style.width = `${viewport.width / dpRatio}px`;
            canvasEl.style.height = `${viewport.height / dpRatio}px`;
            const resolution = 2;
            canvasEl.height = resolution * viewport.height;
            canvasEl.width = resolution * viewport.width;

            // if previous render isn't done yet, we cancel it
            if (renderTask.current) {
                renderTask.current.cancel();
                return;
            }
            renderTask.current = page.render({
                canvasContext,
                viewport,
                transform: [resolution, 0, 0, resolution, 0, 0]
            });

            return renderTask.current.promise
                .then(
                    () => {
                        renderTask.current = null;

                        if (typeof onPageRenderSuccessRef.current === 'function') {
                            onPageRenderSuccessRef.current(page);
                        }
                        return page.getTextContent();
                    },
                    reason => {
                        renderTask.current = null;
                        if (reason && reason.name === 'RenderingCancelledException') {
                            drawPDF(pdfPageRef.current as pdfjs.PDFPageProxy);
                        } else if (typeof onPageRenderFailRef.current === 'function') {
                            onPageRenderFailRef.current(null);
                        }
                    }
                )
                .then(textContent => {
                    createTextlayer(
                        pageWrapper,
                        textContent,
                        // page,
                        viewport,
                        canvasEl.style.width,
                        canvasEl.style.height
                    );
                });
        };

        if (pdfPage) {
            drawPDF(pdfPage);
        }
    }, [pdfPage, scale, rotate]);

    const createTextlayer = (
        wrapper: HTMLElement,
        text: TextContent | void,
        // page,
        viewport: pdfjs.PageViewport,
        width: string,
        height: string
    ) => {
        if (text) {
            const oldDiv = document.getElementById('pdf_viewer_textLayer');
            const textLayerDiv = document.createElement('div');
            textLayerDiv.setAttribute('id', 'pdf_viewer_textLayer');
            textLayerDiv.setAttribute('style', `width:${width};height:${height};word-break:keep-all`);
            textLayerDiv.setAttribute('class', 'text-layer');

            if (oldDiv) {
                wrapper.replaceChild(textLayerDiv, oldDiv);
            } else {
                wrapper.appendChild(textLayerDiv);
            }

            const textLayer = new pdfjs.TextLayer({
                textContentSource: text,
                container: textLayerDiv,
                viewport: viewport
            });

            textLayer.render();
        }
    };
    return { pdfDocument, pdfPage };
};
