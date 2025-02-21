import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { default as ThumbnailView } from './thumbnailView';
import printView from './printView';
import { useTranslation } from 'react-i18next';
import {
    TbArrowLeft,
    TbArrowRight,
    TbDownload,
    TbLayoutSidebarLeftExpand,
    TbPrinter,
    TbRotate2,
    TbRotateClockwise2,
    TbZoomIn,
    TbZoomOut
} from 'react-icons/tb';
import { PDFToolbarProps } from '../../definitions';

/**
 * PDF Viewer toolbar
 */
export default forwardRef((props: PDFToolbarProps, ref) => {
    const {
        pdfDocument,
        pdfPage,
        onZoomSearch,
        onPageSearch,
        onRotateChange,
        onDownloadFile,
        showLoader,
        pageOut,
        scaleOut,
        SCALE_STEP,
        MAX_SCALE,
        MIN_SCALE,
        FILE_LIMIT,
        downloadVisible,
        showError,
        errorMessage
    } = props;

    const { t } = useTranslation();
    const [pageNo, setPageNo] = useState(1);
    const [scale, setScale] = useState('page-actual');
    const [customValue, setCustomValue] = useState<string>('');
    const [sidebarOpen, setSidebarOpen] = useState<string>('');
    const sidebarOpenRef = useRef(sidebarOpen);
    const inputRef = useRef();
    const pageRef = useRef<number>(pageNo);
    const pageOutRef = useRef<number>(pageOut);
    const thumbRef = useRef();
    const printFrameRef = useRef();
    const sidebarContainerRef = useRef();

    useImperativeHandle(ref, () => {
        return {
            initZoomStatus
        };
    }, []);

    useEffect(() => {
        addEvent(window, 'keydown', handleKeyEnter);
        let sidebarContainer = sidebarContainerRef.current;
        addEvent(sidebarContainer, 'transitionend', removeClass);
        return () => {
            removeEvent(window, 'keydown', handleKeyEnter);
            removeEvent(sidebarContainer, 'transitionend', removeClass);
        };
    }, [pdfDocument]);

    useEffect(() => {
        pageOutRef.current = pageOut;
        setPageNo(pageOut);
    }, [pageOut]);

    useEffect(() => {
        pageRef.current = pageNo;
    }, [pageNo]);

    useEffect(() => {
        sidebarOpenRef.current = sidebarOpen;
    }, [sidebarOpen]);

    function addEvent(obj: any, type: string, callback: any) {
        if (obj.addEventListener) {
            obj.addEventListener(type, callback, false);
        } else {
            obj.attachEvent('on' + type, callback);
        }
    }

    function removeEvent(obj: any, type: string, callback: any) {
        if (obj.removeEventListener) {
            obj.removeEventListener(type, callback);
        } else {
            obj.detachEvent('on' + type, callback);
        }
    }

    function handleKeyEnter(e: KeyboardEvent) {
        if (e.key === 'Enter') {
            if (inputRef.current == document.activeElement) {
                onPageBlur();
            }
        }
    }

    function removeClass(e: TransitionEvent) {
        if (!sidebarOpenRef.current.includes('sidebar-open')) {
            setSidebarOpen('');
        }
    }

    const onPageChange = (e: any) => {
        setPageNo(e.target.value);
    };

    const _onPageSearch = (page: number) => {
        const ref: any = thumbRef.current;
        ref.handleScrollView(pdfDocument.numPages, page);
        onPageSearch(page);
    };

    const onPagePrev = (e: any) => {
        if (pageNo === 1) return;
        _onPageSearch(pageNo - 1);
    };

    const onPageNext = (e: any) => {
        if (pageNo == pdfDocument.numPages) {
            return;
        }
        _onPageSearch(pageNo * 1 + 1);
    };

    const onPageBlur = () => {
        let newPageNo = pageRef.current;
        if (!newPageNo || newPageNo * 1 < 1 || newPageNo * 1 > pdfDocument.numPages) {
            setPageNo(pageOutRef.current);
            return;
        }
        _onPageSearch(newPageNo * 1);
    };

    const initZoomStatus = () => {
        setScale('pageActual');
        onZoomSearch('pageActual');
    };

    const onZoomChange = (e: any) => {
        setScale(e.target.value);
        onZoomSearch(e.target.value);
    };

    const onZoomIn = (e: any) => {
        let newValue = Math.round((scaleOut + SCALE_STEP) * 100) + '%';
        setScale('customValue');
        setCustomValue(newValue);
        onZoomSearch(`${scaleOut + SCALE_STEP}`);
    };

    const onZoomOut = (e: any) => {
        let newValue = Math.round((scaleOut - SCALE_STEP) * 100) + '%';
        setScale('customValue');
        setCustomValue(newValue);
        onZoomSearch(`${scaleOut - SCALE_STEP}`);
    };

    const onRotateClock = (e: any) => {
        onRotateChange(true);
    };

    const onRotateAntiClock = (e: any) => {
        onRotateChange(false);
    };

    // const handleInputFileChange = (e) => {
    //     let files = inputFileRef.current.files;
    //     if (files.length > 0) {
    //         if (files[0].type !== "application/pdf") {
    //             onShowError(true, t("formatInfo"));
    //             return;
    //         }
    //         if (files[0].size > FILE_LIMIT) {
    //             onShowError(true, t("sizeInfo"));
    //             return;
    //         }
    //         onUploadFile(files[0]);
    //         setShowDownload(false);
    //     }
    // };

    const onShowSidebar = () => {
        if (sidebarOpen.includes('sidebar-open')) {
            setSidebarOpen('sidebar-moving');
        } else {
            setSidebarOpen('sidebar-open');
        }
    };

    const onPrint = () => {
        const iframe: any = printFrameRef.current;
        const doc = iframe.contentWindow.document;
        let printContainer = iframe.contentWindow.document.body;
        printContainer.innerHTML = '';
        let style = doc.head.getElementsByTagName('style')[0];
        if (!style) {
            style = document.createElement('style');
            style.textContent = `.printedPage{width:100%;height:100%;
                page-break-after:always;
                page-break-inside:avoid;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
            }
            .printedPage img{
                max-width: 100%;
                max-height: 100%;
                direction: ltr;
                display: block;
            }
            `;
            doc.head.append(style);
        }

        iframe.contentWindow.focus();
        showLoader(true);

        printView(pdfDocument, printContainer).then(res => {
            showLoader(false);
            iframe.contentWindow.print();
        });
    };

    const onDownload = () => {
        onDownloadFile();
    };

    return (
        <div className={`outer-container ${sidebarOpen}`}>
            <div className='toolbar-container'>
                <div className='toolbar-viewer'>
                    <div className='toolbar-viewer-left'>
                        <TbLayoutSidebarLeftExpand
                            className='toolbar-button sidebar-toggle'
                            title={t('sidebarToggle')}
                            onClick={onShowSidebar}
                        />
                        <div className='toolbar-button-spacer'></div>
                        {/* <button id="viewFind" className="toolbar-button" title="Find in Document" tabindex="12" data-l10n-id="findbar">
                            <span data-l10n-id="findbar_label">Find</span>
                        </button> */}
                        <TbArrowLeft
                            className={`toolbar-button previous${pageNo == 1 ? ' disabled' : ''}`}
                            title={t('previous')}
                            onClick={onPagePrev}
                        />
                        <div className='pagination'>
                            <input
                                ref={inputRef as any}
                                type='number'
                                title={t('pageNumber')}
                                value={pageNo}
                                min='1'
                                autoComplete='off'
                                onChange={onPageChange}
                                onBlur={onPageBlur}
                                disabled={!pdfDocument}
                            />
                            <span className='num-pages'>/ {pdfDocument?.numPages || 0}</span>
                        </div>
                        <TbArrowRight
                            className={`toolbar-button next${!pdfDocument || pageNo >= pdfDocument.numPages ? ' disabled' : ''}`}
                            title={t('next')}
                            onClick={onPageNext}
                        />
                    </div>
                    <div className='toolbar-viewer-middle'>
                        <TbZoomOut
                            className={`toolbar-button zoomOut${scaleOut === MIN_SCALE ? ' disabled' : ''}`}
                            title={t('zoomOut')}
                            onClick={onZoomOut}
                        />
                        <span className='scale-select-container dropdown-toolbar-button'>
                            <select title={t('scaleSelect')} onChange={onZoomChange} value={scale}>
                                <option title='' value='auto'>
                                    {t('pageAutoOption')}
                                </option>
                                <option title='' value='page-actual'>
                                    {t('pageActualOption')}
                                </option>
                                <option title='' value='page-fit'>
                                    {t('pageFitOption')}
                                </option>
                                <option title='' value='page-width'>
                                    {t('pageWidthOption')}
                                </option>
                                <option title='' value='customValue' disabled hidden={true}>
                                    {customValue}
                                </option>
                                <option title='' value='0.5'>
                                    50%
                                </option>
                                <option title='' value='0.75'>
                                    75%
                                </option>
                                <option title='' value='1'>
                                    100%
                                </option>
                                <option title='' value='1.25'>
                                    125%
                                </option>
                                <option title='' value='1.5'>
                                    150%
                                </option>
                                <option title='' value='2'>
                                    200%
                                </option>
                                <option title='' value='3'>
                                    300%
                                </option>
                                <option title='' value='4'>
                                    400%
                                </option>
                            </select>
                        </span>
                        <TbZoomIn
                            className={`toolbar-button zoomIn${scaleOut === MAX_SCALE ? ' disabled' : ''}`}
                            title={t('zoomIn')}
                            onClick={onZoomIn}
                        />
                    </div>
                    <div className='toolbar-viewer-right'>
                        <TbPrinter className='toolbar-button print' title={t('print')} onClick={onPrint} />
                        {downloadVisible && (
                            <TbDownload
                                className='toolbar-button download'
                                title={t('downloadFile')}
                                onClick={onDownload}
                            />
                        )}
                        <TbRotate2
                            className='toolbar-button page-rotate-ccw'
                            title={t('pageRotateCcw')}
                            onClick={onRotateAntiClock}
                        />
                        <TbRotateClockwise2
                            className='toolbar-button pageRotateCw'
                            title={t('pageRotateCw')}
                            onClick={onRotateClock}
                        />
                    </div>
                </div>
            </div>
            <div className='sidebar-container' ref={sidebarContainerRef as any}>
                {/* <div className='toolbar-sidebar'>
                    <div className='toolbar-sidebar-left'>
                        <div
                            className='sidebar-view-buttons split-toolbar-button toggled'
                            role='radiogroup'
                        >
                            <TbListDetails
                                className='view-thumbnail toolbar-button toggled'
                                title={t("viewThumbnail")}
                            />
                        </div>
                    </div>
                </div> */}
                <ThumbnailView
                    ref={thumbRef}
                    pdfDocument={pdfDocument}
                    onPageSearch={onPageSearch}
                    page={pageOut}
                    showError={showError}
                    errorMessage={errorMessage}
                />
                <div className='sidebar-resizer'></div>
            </div>
            <iframe className='print-iframe' ref={printFrameRef as any}></iframe>
        </div>
    );
});
