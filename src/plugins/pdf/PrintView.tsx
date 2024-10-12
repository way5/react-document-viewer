import { _getObjectUrl } from "../../utils";

/**
 * PDF Viewer Print View
 */
export default (pdfDocument: any, container: any) => {
    return new Promise((resolve: any) => {
        if (pdfDocument) {
            let numPages = pdfDocument.numPages;
            let pagePromiseArr: any = [],
                documentPromiseArr = [];
            for (let i = 1; i <= numPages; i++) {
                documentPromiseArr.push(pdfDocument.getPage(i));
            }
            Promise.all(documentPromiseArr)
                .then((pdfPages) => {
                    pdfPages.forEach((page) => {
                        pagePromiseArr.push(getRenderTask(page));
                    });
                    serialDrawPage(pagePromiseArr);
                })
                .catch((err) => {
                    console.log('(!) error while preparing document:', err);
                });
        }
        const getRenderTask = (page: any) => {
            let viewport = page.getViewport({ scale: 1, rotation: 0 });
            let { width, height } = viewport;
            const canvasEl = document.createElement("canvas");
            const canvasContext = canvasEl.getContext("2d");
            canvasEl.style.width = `${width}px`;
            canvasEl.style.height = `${height}px`;
            const resolution = 2;
            canvasEl.height = resolution * viewport.height;
            canvasEl.width = resolution * viewport.width;

            // if previous render isn't done yet, we cancel it
            return {
                renderTask: page.render({
                    canvasContext,
                    viewport,
                    intent: "print",
                    transform: [resolution, 0, 0, resolution, 0, 0],
                }).promise,
                pageInfo: {
                    page,
                    canvasEl,
                },
            };
        };

        const serialDrawPage = (renderTasks: any) => {
            const maxCount = renderTasks.length;
            let loadCount = 0;
            let count = 0;
            function next(task: any) {
                if (count >= maxCount) {
                    return;
                }
                task.renderTask.then((res: any) => {
                    let viewer = container;
                    let { canvasEl } = task.pageInfo;
                    if (!viewer) return;
                    const img = document.createElement("img");
                    if (canvasEl.toBlob) {
                        canvasEl.toBlob((blob: any) => {
                            img.src = _getObjectUrl(blob);
                        });
                    } else {
                        img.src = canvasEl.toDataURL();
                    }
                    let pageDiv = document.createElement("div");
                    pageDiv.setAttribute("class", "printedPage");
                    pageDiv.appendChild(img);
                    viewer.appendChild(pageDiv);
                    count++;
                    img.onload = () => {
                        loadCount++;
                        if (loadCount == maxCount) {
                            resolve();
                        }
                    };
                    next(renderTasks[count]);
                });
            }
            next(renderTasks[count]);
        };
    });
};
