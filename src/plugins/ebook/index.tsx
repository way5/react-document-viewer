import React, { useEffect, useRef, useState } from 'react';
import EbookViewerToolbar from './toolbar';
import { _getBlobUrlFromBuffer, _download } from '../../utils';
import { useTranslation } from 'react-i18next';
import { ActionType, ImageViewerToolbarConfig, ViewerPluginProps } from '../../definitions';
import * as zip from '@zip.js/zip.js';
import { TOCProgress, SectionProgress } from 'foliate-js/progress.js';
// import * as CFI from 'foliate-js/epubcfi.js';
import TOC from './toc';
import SectionElement from './section';
import SectionMarker from './marker';

export default (props: ViewerPluginProps) => {
    const {
        fileBuffer,
        activeFile,
        fileType,
        // activeIndex,
        // changeHandler,
        showFileName,
        allowDownloadFile,
        showLoader = (s) => {},
        showError = (s) => {},
        // setOnHideError = (f) => {},
        errorMessage = (m) => {},
        // setFileOpen = () => {},
    } = props;

    const { t } = useTranslation();
    const scrollRef = useRef<HTMLDivElement>(null);
    const scrollWrapperRef = useRef<HTMLDivElement>(null);
    const progressBarRef = useRef<HTMLDivElement>(document.querySelector('.progress-bar__outer'));
    const [bookSections, setBookSections] = useState<any>({});
    const [book, setBook] = useState<any>(null);
    const [bookMeta, setBookMeta] = useState<any>({});
    const [bookSectionProgress, setBookSectionProgress] = useState<SectionProgress>();
    const [bookTocProgress, setBookTocProgress] = useState<TOCProgress>();
    const [currentSection, setCurrentSection] = useState<{ index: number; progress: number }>({
        index: 0,
        progress: 0,
    });
    const [sidebarShown, setSidebarShown] = React.useState(false);
    const [sectionLengths, setSectionLengths] = useState<{ [key: number]: number }>({});
    // const [zoomLevel, setZoomLevel] = useState<number>(1);

    const filterScrollEvent = (e: Event, sectionProgress: SectionProgress) => {
        let i = 0;
        let scrollTopPosition = 0;
        const scroller = scrollRef.current as HTMLDivElement;
        const values = Object.values(sectionProgress.sizes as { [key: number]: number });
        // const lengthFull = sectionProgress.sizeTotal;
        const lengthFull = Object.values(sectionLengths).reduce((a, b) => a + b, 0);
        do {
            scrollTopPosition += values[i];
            if (scrollTopPosition < scroller.scrollTop && scroller.scrollTop < scrollTopPosition + values[i + 1]) {
                setCurrentSection({
                    index: i,
                    progress: (scroller.scrollTop / lengthFull) * 100,
                });
                break;
            }
            i++;
        } while (i < values.length);
    };

    // jump to section
    const filterCursorChangeEvent = (e: MouseEvent, sectionProgress: SectionProgress) => {
        let progress = 0;
        const barState = progressBarRef.current?.getBoundingClientRect() as DOMRect;
        if (e.clientY >= barState.top) {
            progress = (e.clientY - barState.top) / barState.height;
            scrollRef.current?.scrollTo(0, progress * sectionProgress.sizeTotal);
            // scrollRef.current?.scrollTo(0, progress * lengthFull);
        }
    };

    useEffect(() => {
        if (fileBuffer) {
            showLoader(true);
            (async () => {
                let sectionProgress: any = null;
                let tocProgress: any = null;
                // let pageProgress: any = null;
                const book = await loadContent(fileBuffer);
                if (book) {
                    setBookMeta(book.metadata);
                    setBook(book);
                    if (book.splitTOCHref && book.getTOCFragment) {
                        const ids = book.sections.map((s: any) => s.id);
                        sectionProgress = new SectionProgress(book.sections, 1500, 1600);
                        const splitHref = book.splitTOCHref.bind(book);
                        const getFragment = book.getTOCFragment.bind(book);
                        tocProgress = new TOCProgress();
                        await tocProgress.init({
                            toc: book.toc ?? [],
                            ids,
                            splitHref,
                            getFragment,
                        });
                    }

                    // if (book.sections.some((section: any) => section.mediaOverlay)) {
                    //     book.media.activeClass ||= '-epub-media-overlay-active';
                    //     const activeClass = book.media.activeClass;
                    //     const mediaOverlay = book.getMediaOverlay();
                    //     let lastActive
                    //     mediaOverlay.addEventListener('highlight', e => {
                    //         const resolved = this.resolveNavigation(e.detail.text)
                    //         goTo(resolved)
                    //         const { doc } = this.renderer.getContents()
                    //             .find(x => x.index = resolved.index)
                    //         const el = resolved.anchor(doc)
                    //         el.classList.add(activeClass)
                    //         lastActive = new WeakRef(el)
                    //     })
                    //     mediaOverlay.addEventListener('unhighlight', () => {
                    //         lastActive?.deref()?.classList?.remove(activeClass)
                    //     })
                    // }

                    setBookSectionProgress(sectionProgress);
                    setBookTocProgress(tocProgress);
                    // console.log(sectionProgress, tocProgress)
                    // window.removeEventListener('popstate', (e: any) => historyPopstateHandler(e), false);
                    scrollRef.current?.removeEventListener(
                        'scroll',
                        (e: Event) => filterScrollEvent(e, sectionProgress),
                        false,
                    );
                    progressBarRef.current?.removeEventListener(
                        'mousedown',
                        (e: MouseEvent) => filterCursorChangeEvent(e, sectionProgress),
                        false,
                    );
                    scrollWrapperRef.current?.removeEventListener('click', (e: Event) => showSidebar(false), true);
                    // add page switching
                    scrollRef.current?.addEventListener(
                        'scroll',
                        (e: Event) => filterScrollEvent(e, sectionProgress),
                        false,
                    );
                    // jump to section
                    progressBarRef.current?.addEventListener(
                        'mousedown',
                        (e: MouseEvent) => filterCursorChangeEvent(e, sectionProgress),
                        false,
                    );
                    // handle history
                    // window.addEventListener('popstate', (e: any) => historyPopstateHandler(e), false);
                    scrollWrapperRef.current?.addEventListener('click', (e: Event) => showSidebar(false), true);
                }
                showLoader(false);
            })();
        }
    }, [fileBuffer]);

    useEffect(() => {
        (async () => {
            if (book) {
                let arr = {};
                let i = 0;
                for (; i < book.sections.length; i++) {
                    let url = await book.sections[i].load();
                    arr = { ...arr, [i]: { src: url, id: book.sections[i].id } };
                }
                setBookSections(arr);
            }
        })();
    }, [book]);

    const makeZipLoader = async (data: Uint8Array) => {
        zip.configure({ useWebWorkers: false });
        const reader = new zip.ZipReader(new zip.BlobReader(new Blob([data])));
        const entries = await reader.getEntries();
        const map = new Map(entries.map((entry) => [entry.filename, entry]));
        const load =
            (f: any) =>
            (name: string, ...args: any[]) =>
                map.has(name) ? f(map.get(name), ...args) : null;

        const loadText = load((entry: any) => entry.getData(new zip.TextWriter()));
        const loadBlob = load((entry: any, type: string) => entry.getData(new zip.BlobWriter(type)));
        const getSize = (name: string) => map.get(name)?.uncompressedSize ?? 0;
        return { entries, loadText, loadBlob, getSize };
    };

    const loadContent = async (data: Uint8Array) => {
        let book = null;

        try {
            if (fileType.isZip) {
                const loader = await makeZipLoader(data);

                if (fileType.contentType == 'fb2') {
                    const { makeFB2 } = await import('foliate-js/fb2.js')
                    const { entries } = loader
                    const entry = entries.find(entry => entry.filename.endsWith('.fb2'))
                    const blob = await loader.loadBlob((entry ?? entries[0]).filename)
                    book = await makeFB2(blob)
                } else if (fileType.contentType == 'epub') {
                    const { EPUB } = await import('foliate-js/epub.js')
                    book = await new EPUB(loader).init();
                }
            } else if (fileType.contentType == 'fb2') {
                const { makeFB2 } = await import('foliate-js/fb2.js');
                book = await makeFB2(new Blob([data]));
            } else if (fileType.contentType == 'mobi') {
                const { MOBI } = await import('foliate-js/mobi.js')
                const fflate = await import('fflate')
                book = await new MOBI({ unzlib: fflate.unzlibSync }).open(new Blob([data]))
            } else
                throw new Error('(!) unknown file type')
        } catch (e) {
            errorMessage(`(!) error loading document: ${e}`);
            showError(true);
        } finally {
            // showLoader(false);
            // setFileOpen(true);
        }

        return book;
    };

    const handleDownload = () => {
        const fileUrl = _getBlobUrlFromBuffer(fileBuffer, fileType.extension);
        _download(fileUrl, bookMeta.title || activeFile.name, fileType.extension);
    };

    const showSidebar = (show: boolean) => {
        const sidebar = document.querySelector('div.doc-viewer .sidebar');
        if (show) {
            sidebar?.classList.add('visible');
            setSidebarShown(true);
        } else {
            sidebar?.classList.remove('visible');
            setSidebarShown(false);
        }
    };

    const handleAction = (props: ImageViewerToolbarConfig) => {
        switch (props.key) {
            case 'download':
                handleDownload();
                break;
            case 'toc':
                showSidebar(props.actionType === ActionType.show);
                break;
            default:
                break;
        }
    };

    // const resolveNavigation = (href: any) => {
    //     let resolved: { index: number, anchor?: string | ((doc: any) => void), hash?: string } = { index: 0 };
    //     try {
    //         if (typeof href === 'number')
    //             return { index: href }
    //         else if (typeof href === 'string') {
    //             // const [index, anchor] = bookSectionProgress.getSection(href)
    //             // resolved = { index, anchor }
    //             const [ anchor, hash] = href.split('#');
    //             resolved = { 'index': 0, anchor, hash }
    //         }
    //         else if (CFI.isCFI.test(href)) {
    //             if (book.resolveCFI)
    //                 resolved = book.resolveCFI(href)
    //             else {
    //                 const parts = CFI.parse(href)
    //                 const index = CFI.fake.toIndex((parts.parent ?? parts).shift())
    //                 const anchor = (doc: any) => CFI.toRange(doc, parts)
    //                 resolved = { index, anchor }
    //             }
    //         } else
    //             resolved = book.resolveHref(href)

    //     } catch (e) {
    //         console.error(e)
    //         console.error(`Could not resolve target ${href}`)
    //     }
    //     return resolved;
    // }

    /**
     * Handle internal navigation
     *
     * @param {string} href
     */
    const goTo = (href: string): void => {
        const anchor = href.split('#');
        const needle = document.querySelector(`[name="${anchor[0]}"]`);
        needle?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // TODO
        // history.pushState({ page: anchor[0] }, '', `#${anchor[0]}`);
        if (anchor[1] && needle instanceof HTMLIFrameElement) {
            const needleDoc = needle.contentDocument || needle.contentWindow?.document;
            needleDoc?.querySelector(`[id="${anchor[1]}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const setSectionLength = (i: number, length: number) => {
        const a = sectionLengths;
        a[i] = Math.ceil(length);
        setSectionLengths(a);
    }

    return (
        <div className="epub-document">
            <EbookViewerToolbar
                onAction={handleAction}
                fileName={bookMeta.title || activeFile.name}
                fileType={fileType.simpleType}
                disabled={!fileBuffer}
                showFileName={showFileName}
                showDownloadButton={allowDownloadFile}
                showSidebar={sidebarShown}
            />
            <div className="sidebar">
                <div className="header">{t('TableOfContents')}</div>
                {bookTocProgress && <TOC map={bookTocProgress.map} resolveNavigation={goTo} />}
            </div>
            <div className="scroll-wrapper" ref={scrollWrapperRef}>
                <div className="progress-bar-container">
                    <div className="progress-bar-bg">
                        <div className="progress-bar-inner">
                            {bookSectionProgress &&
                                Object.keys(bookSectionProgress.sectionFractions).map((v: any, i: number) => {
                                    const items = bookTocProgress && bookTocProgress.map.get(bookTocProgress.ids[i]);
                                    const label = items && (items.items[0].item.label ?? null);
                                    return (
                                        <SectionMarker
                                            itemId={i}
                                            key={i}
                                            href={bookTocProgress.ids[i]}
                                            label={label}
                                            style={{ top: `${bookSectionProgress.sectionFractions[v] * 100}%` }}
                                        />
                                    );
                                })}
                            <div className="progress-bar__outer" ref={progressBarRef}>
                                <div
                                    className="progress-bar__inner"
                                    style={{ height: `${currentSection.progress}%` }}
                                ></div>
                                <div
                                    className="progress-bar__mean"
                                    style={{ height: `calc(100% - ${currentSection.progress}%)` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="scroll" ref={scrollRef}>
                    {bookSections &&
                        Object.values(bookSections).map((v: any, i: number) => {
                            return (
                                <SectionElement
                                    itemId={i}
                                    key={i}
                                    section={v}
                                    book={book}
                                    resolveNavigation={goTo}
                                    setSectionLength={setSectionLength}
                                />
                            );
                        })}
                </div>
            </div>
        </div>
    );
};
