import React, {
    useEffect,
    useRef,
    useImperativeHandle,
    forwardRef,
} from "react";
import { _getObjectUrl } from "../../utils";
import { PDFThumbsProps } from "../../definitions";

const THUMBNAIL_WIDTH = 98;

/**
 * PDF Viewer Thumbnails Sidebar panel
 */
export default forwardRef((props: PDFThumbsProps, ref) => {
    const { pdfDocument, onPageSearch, page, showError, errorMessage } = props;

    const sidebarRef = useRef<any>();
    const viewportRef = useRef<any>();
    const selectedPageRef = useRef<any>();

    useImperativeHandle(ref, () => {
        return {
            handleScrollView,
        };
    }, []);

    useEffect(() => {
        if (pdfDocument) {
            let numPages = pdfDocument.numPages;
            let pagePromiseArr: any = [],
                documentPromiseArr = [];
            for (let i = 1; i <= numPages; i++) {
                documentPromiseArr.push(pdfDocument.getPage(i));
            }
            Promise.all(documentPromiseArr)
                .then((pdfPages) => {
                    pdfPages.forEach((page: any) => {
                        pagePromiseArr.push(getRenderTask(page));
                    });
                    serialDrawPage(pagePromiseArr);
                })
                .catch((err) => {
                    errorMessage(err);
                    showError(true);
                });
        }
        return () => {
            resetThumbnail();
        };
    }, [pdfDocument]);

    const getRenderTask = (page: any) => {
        let adjustScale = 1;

        if (!viewportRef.current) {
            let viewport = page.getViewport({ scale: 1, rotation: 0 });
            let { width, height } = viewport;
            adjustScale = THUMBNAIL_WIDTH / width;
            viewport = page.getViewport({ scale: adjustScale, rotation: 0 });
            viewportRef.current = viewport;
        }

        let { width, height } = viewportRef.current;
        const canvasEl = document.createElement("canvas");
        const canvasContext = canvasEl.getContext("2d");
        canvasEl.style.width = `${width}px`;
        canvasEl.style.height = `${height}px`;
        canvasEl.height = height;
        canvasEl.width = width;

        return {
            renderTask: page.render({
                canvasContext,
                viewport: viewportRef.current,
            }).promise,
            pageInfo: {
                page,
                canvasEl,
            },
        };
    };

    const serialDrawPage = (pagePromiseArr: any) => {
        const maxCount = pagePromiseArr.length;
        let count = 0;

        function next(pagePromise: any) {
            if (count >= maxCount) return;
            pagePromise.renderTask.then((res: any) => {
                let viewer = sidebarRef.current;
                let { canvasEl } = pagePromise.pageInfo;
                if (!viewer) return;

                const img = document.createElement("img");

                if (canvasEl.toBlob) {
                    canvasEl.toBlob((blob: object) => {
                        img.src = _getObjectUrl(blob);
                    });
                } else {
                    img.src = canvasEl.toDataURL();
                }

                let pageDiv = document.getElementById(`page=${count + 1}`);

                if (!pageDiv) {
                    let className = "thumbnail";
                    pageDiv = document.createElement("div");
                    pageDiv.setAttribute("id", `page=${count + 1}`);

                    if (count == 0) {
                        if (!selectedPageRef.current) {
                            selectedPageRef.current = pageDiv;
                            className = className + " selected";
                        }
                    }

                    pageDiv.setAttribute("class", className);
                    viewer.appendChild(pageDiv);
                    pageDiv.appendChild(img);
                } else {
                    let canvasImgDom = pageDiv.children[0];
                    if (canvasImgDom) {
                        pageDiv.replaceChild(img, canvasImgDom);
                    }
                }

                count++;
                next(pagePromiseArr[count]);
            });
        }
        next(pagePromiseArr[count]);
    };

    const handleChangePage = (e: any) => {
        let pageDiv = e.target.parentNode;
        if (!pageDiv.id.includes("page=")) return;
        let className = pageDiv.getAttribute("class");
        if (className && className.includes("selected")) return;

        pageDiv.setAttribute("class", "thumbnail selected");
        if (selectedPageRef.current) {
            selectedPageRef.current.setAttribute("class", "thumbnail");
        }
        selectedPageRef.current = pageDiv;
        let pageNo = pageDiv.id.split("=")[1];
        if (pageNo * 1 > 0) {
            onPageSearch(pageNo * 1);
        }
    };

    const handleScrollView = (numPages: number, page: number) => {
        if (viewportRef.current?.height) {
            if (
                numPages * viewportRef.current?.height >
                sidebarRef.current.clientHeight
            ) {
                sidebarRef.current.scrollTo(
                    0,
                    (page - 1) * viewportRef.current?.height
                );
            }
        }

        let pageDiv = sidebarRef.current.children[page - 1];
        if (pageDiv) {
            pageDiv.setAttribute("class", "thumbnail selected");
            if (selectedPageRef.current) {
                selectedPageRef.current.setAttribute("class", "thumbnail");
            }
            selectedPageRef.current = pageDiv;
        }
    };

    const resetThumbnail = () => {
        selectedPageRef.current = null;
        viewportRef.current = null;
        if(sidebarRef.current)
            sidebarRef.current.innerHTML = "";
    };

    return (
        <div className='sidebar-content'>
            <div
                className='thumbnail-view'
                ref={sidebarRef}
                onClick={handleChangePage}
            ></div>
        </div>
    );
});
