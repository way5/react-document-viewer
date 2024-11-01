import React, {useState, useEffect} from "react";
import ImageViewerCanvas from "./canvas";
import ImageViewerNavigation from "./navigation";
import { default as ImageViewerToolbar } from "./toolbar";
import {
    ViewerPluginProps,
    ImageViewerToolbarConfig,
    ActionType,
    ImageViewerDefaultToolbar,
    ImageViewerCoreState,
} from "../../definitions";
import { useTranslation } from "react-i18next";
import { _getBlobUrlFromBuffer, basename } from "../../utils";

/**
 * Description placeholder
 *
 * @type {{ setVisible: string; setActiveIndex: string; update: string; }}
 */
const ACTION_TYPES = {
    setVisible: "setVisible",
    setActiveIndex: "setActiveIndex",
    update: "update",
};

function createAction(type: string, payload: Object) {
    return {
        type,
        payload: payload || {},
    };
}

/**
 * Image Viewer Plugin
 *
 * @type {({})}
 */
export default (props: ViewerPluginProps) => {
    const footerHeight = 84;
    const { t } = useTranslation();

    const {
        fileBuffer,
        fileType,
        activeFile,
        filesTotal,
        activeIndex = 0,
        drag = true,
        showAttributes = true,
        showFileName = true,
        zoomable = true,
        rotatable = true,
        scalable = true,
        changeable = true,
        customToolbar = (toolbars) => toolbars,
        zoomSpeed = 0.05,
        disableKeyboardSupport = false,
        noResetZoomAfterChange = false,
        noLimitInitializationSize = false,
        defaultScale = 1,
        allowLoop = true,
        disableMouseZoom = false,
        noImgDetails = false,
        noToolbar = false,
        showTotal = true,
        minScale = 0.1,
        changeHandler = (i: number) => {},
        allowDownloadFile = true,
        showLoader = (s) => {},
        showError = (s) => {},
        setOnHideError = (f) => {},
        errorMessage = (m) => { },
        // setFileOpen = () => {},
        noNavbar = false,
    } = props;

    const initialState: ImageViewerCoreState = {
        activeIndex: props.activeIndex || 0,
        width: 0,
        height: 0,
        top: 15,
        left: 0,
        rotate: 0,
        imageWidth: 0,
        imageHeight: 0,
        showFileName: showFileName,
        scaleX: defaultScale,
        scaleY: defaultScale,
        loading: false,
        loadFailed: false,
        startLoading: false,
    };

    const [imageElement, setImageElement] = useState<HTMLImageElement>();
    const viewerCore = React.useRef<HTMLDivElement>(null);
    const currentIndex = React.useRef<number>(0);
    const [fileName, setFileName] = React.useState<string>('');
    const containerSize = React.useRef( { width: 0, height: 0 } );
    const showNavbar = !noNavbar && filesTotal > 1;
    const [state, dispatch] = React.useReducer<
            (s: any, a: any) => ImageViewerCoreState
            >(reducer, initialState);

    function reducer(s: ImageViewerCoreState, action: any): typeof initialState {
        switch (action.type) {
            case ACTION_TYPES.setActiveIndex:
                return {
                    ...s,
                    activeIndex: action.payload.index,
                    startLoading: true,
                };

            case ACTION_TYPES.update:
                return {
                    ...s,
                    ...action.payload,
                };

            default:
                break;
        }
        return s;
    }

    useEffect(() => {
        containerSize.current = getContainerWidthHeight();
    }, []);

    useEffect(() => {
        bindEvent();
        return () => {
            bindEvent(true);
        };
    });

    useEffect(() => {
        setFileName(activeFile.name || basename(activeFile.src));
        dispatch(
            createAction(ACTION_TYPES.setActiveIndex, {
                index: activeIndex,
            })
        );
    }, [fileBuffer]);

    useEffect(() => {
        if (state.startLoading) {
            currentIndex.current = state.activeIndex;
            // setFileOpen(true);
            loadImg(state.activeIndex);
        }
    }, [state.startLoading]);

    /**
     * Calculate canvas dimmensions
     *
     * @returns {{ width: any; height: any; }}
     */
    function getContainerWidthHeight() {
        const canvasElement = viewerCore.current?.childNodes[0] as HTMLElement;
        const width = canvasElement?.offsetWidth;
        const height = canvasElement?.offsetHeight;
        return {
            width,
            height,
        };
    }

    function getFooterHeight() {
        const footerElement = viewerCore.current?.childNodes[1] as HTMLElement;
        return footerElement?.offsetHeight;
    }

    function loadImg(currentActiveIndex: number, isReset = false) {
        dispatch(
            createAction(ACTION_TYPES.update, {
                loading: true,
                loadFailed: false,
            })
        );
        const image = new Image();
        image.onload = () => {
            loadImgSuccess(image.width, image.height, true);
            setImageElement(image);
        }
        // error
        image.onerror = () => {
            dispatch(
                createAction(ACTION_TYPES.update, {
                    loading: false,
                    loadFailed: false,
                    startLoading: false,
                })
            );
            errorMessage(t('imgLoadError'));
            showError(true);
        }
        //
        if (fileBuffer) {
            const imageUrl = _getBlobUrlFromBuffer(fileBuffer, fileType.extension);
            image.src = imageUrl;
        }

        function loadImgSuccess(
            imgWidth: number,
            imgHeight: number,
            success: boolean
        ) {
            if (currentActiveIndex !== currentIndex.current) {
                return;
            }
            let realImgWidth = imgWidth;
            let realImgHeight = imgHeight;

            if (props.defaultSize) {
                realImgWidth = props.defaultSize.width;
                realImgHeight = props.defaultSize.height;
            }
            if (activeFile.defaultSize) {
                realImgWidth = activeFile.defaultSize.width;
                realImgHeight = activeFile.defaultSize.height;
            }
            let [width, height] = getImgWidthHeight(
                realImgWidth,
                realImgHeight
            );

            let left = (containerSize.current.width - width) / 2;
            let top =
                (containerSize.current.height - height - footerHeight) / 2;
            let scaleX = defaultScale;
            let scaleY = defaultScale;

            if (noResetZoomAfterChange && !isReset) {
                scaleX = state.scaleX;
                scaleY = state.scaleY;
            }

            dispatch(
                createAction(ACTION_TYPES.update, {
                    width: width,
                    height: height,
                    left: left,
                    top: top,
                    imageWidth: imgWidth,
                    imageHeight: imgHeight,
                    loading: false,
                    rotate: 0,
                    scaleX: scaleX,
                    scaleY: scaleY,
                    loadFailed: !success,
                    startLoading: false,
                })
            );
            // hide global loader
            showLoader(false);
        }
    }

    function getImgWidthHeight(imgWidth: number, imgHeight: number) {
        let width = 0;
        let height = 0;
        let maxWidth = containerSize.current.width * 0.8;
        let maxHeight = (containerSize.current.height - footerHeight) * 0.8;
        width = Math.min(maxWidth, imgWidth);
        height = (width / imgWidth) * imgHeight;
        if (height > maxHeight) {
            height = maxHeight;
            width = (height / imgHeight) * imgWidth;
        }
        if (noLimitInitializationSize) {
            width = imgWidth;
            height = imgHeight;
        }
        return [width, height];
    }

    function handleChangeImg(newIndex: number) {
        if (!allowLoop && (newIndex >= filesTotal || newIndex < 0)) {
            return;
        }
        if (newIndex >= filesTotal) {
            newIndex = 0;
        }
        if (newIndex < 0) {
            newIndex = filesTotal - 1;
        }

        if (newIndex === state.activeIndex) {
            return;
        }
        // inform parent that we've changed active index
        changeHandler(newIndex);
    }

    function handleDownload() {
        if (activeFile.src) {
            if (props.downloadInNewWindow) {
                window.open(activeFile.src, "_blank");
            } else {
                location.href = activeFile.src;
            }
        }
    }

    function handleMirrorX(newScale: 1 | -1) {
        dispatch(
            createAction(ACTION_TYPES.update, {
                scaleX: state.scaleX * newScale,
            })
        );
    }

    function handleMirrorY(newScale: 1 | -1) {
        dispatch(
            createAction(ACTION_TYPES.update, {
                scaleY: state.scaleY * newScale,
            })
        );
    }

    function handleRotate(isRight: boolean = false) {
        dispatch(
            createAction(ACTION_TYPES.update, {
                rotate: state.rotate + 90 * (isRight ? 1 : -1),
            })
        );
    }

    function handleDefaultAction(type: ActionType = ActionType.noOp) {
        switch (type) {
            case ActionType.prev:
                handleChangeImg(state.activeIndex - 1);
                break;
            case ActionType.next:
                handleChangeImg(state.activeIndex + 1);
                break;
            case ActionType.zoomIn:
                let imgCenterXY = getImageCenterXY();
                handleZoom(imgCenterXY.x, imgCenterXY.y, 1, zoomSpeed);
                break;
            case ActionType.zoomOut:
                let imgCenterXY2 = getImageCenterXY();
                handleZoom(imgCenterXY2.x, imgCenterXY2.y, -1, zoomSpeed);
                break;
            case ActionType.rotateLeft:
                handleRotate();
                break;
            case ActionType.rotateRight:
                handleRotate(true);
                break;
            case ActionType.reset:
                loadImg(state.activeIndex, true);
                break;
            case ActionType.scaleX:
                handleMirrorX(-1);
                break;
            case ActionType.scaleY:
                handleMirrorY(-1);
                break;
            case ActionType.download:
                handleDownload();
                break;
            default:
                break;
        }
    }

    function handleAction(config: ImageViewerToolbarConfig) {
        handleDefaultAction(config.actionType);
        // callback for additional functionality
        if (config.onClick) {
            config.onClick(activeFile);
        }
    }

    function handleChangeImgState(
        width: number,
        height: number,
        top: number,
        left: number
    ) {
        dispatch(
            createAction(ACTION_TYPES.update, {
                width: width,
                height: height,
                top: top,
                left: left,
            })
        );
    }

    function handleResize() {
        containerSize.current = getContainerWidthHeight();
        let imgSize: number[] = [0, 0];
        // TODO: investigate why state values got reset
        if (state.width === 0) {
            const imgElement = viewerCore.current?.childNodes[0].childNodes[0] as HTMLImageElement;
            imgSize = [imgElement.clientWidth, imgElement.clientHeight];
        }

        let left = (containerSize.current.width - (state.width || imgSize[0])) / 2;
        let top = (containerSize.current.height - (state.height || imgSize[1]) - state.height - getFooterHeight()) / 2;

        dispatch(
            createAction(ACTION_TYPES.update, {
                left: left,
                top: top,
            })
        );
    }

    function bindEvent(remove: boolean = false) {
        if (!disableKeyboardSupport) {
            if(remove)
                document.removeEventListener("keydown", handleKeydown, true);
            else
                document.addEventListener("keydown", handleKeydown, true);
        }
        if (viewerCore.current) {
            if(remove)
                viewerCore.current.removeEventListener("wheel", handleMouseScroll, false);
            else
                viewerCore.current.addEventListener("wheel", handleMouseScroll, false);
        }
    }

    // See: https://developer.mozilla.org/en-US/docs/Web/API/UI_Events/Keyboard_event_key_values
    function handleKeydown(e: KeyboardEvent) {
        let keyCode = e.key;
        let isFeatrue = false;
        switch (keyCode) {
            // key: ←
            case "ArrowLeft":
                if (e.ctrlKey) {
                    handleDefaultAction(ActionType.rotateLeft);
                } else {
                    handleDefaultAction(ActionType.prev);
                }
                isFeatrue = true;
                break;
            // key: →
            case "ArrowRight":
                if (e.ctrlKey) {
                    handleDefaultAction(ActionType.rotateRight);
                } else {
                    handleDefaultAction(ActionType.next);
                }
                isFeatrue = true;
                break;
            // key: ↑
            case "ArrowUp":
                handleDefaultAction(ActionType.zoomIn);
                isFeatrue = true;
                break;
            // key: ↓
            case "ArrorDown":
                handleDefaultAction(ActionType.zoomOut);
                isFeatrue = true;
                break;
            // key: Ctrl + 1
            case "1":
                if (e.ctrlKey) {
                    loadImg(state.activeIndex);
                    isFeatrue = true;
                }
                break;
            default:
                break;
        }
        if (isFeatrue) {
            e.preventDefault();
            e.stopPropagation();
        }
    }

    /**
     * Description placeholder
     *
     * @param {*} e
     */
    function handleMouseScroll(e: WheelEvent) {
        if (disableMouseZoom) {
            return;
        }
        if (state.loading) {
            return;
        }
        e.preventDefault();
        let direct: 0 | 1 | -1 = 0;
        const value = e.deltaY;
        if (value === 0) {
            direct = 0;
        } else {
            direct = value > 0 ? -1 : 1;
        }
        if (direct !== 0) {
            let x = e.clientX;
            let y = e.clientY;
            handleZoom(x, y, direct, zoomSpeed);
        }
    }

    /**
     * Description placeholder
     *
     * @returns {{ x: any; y: any; }}
     */
    function getImageCenterXY() {
        return {
            x: state.left + state.width / 2,
            y: state.top + state.height / 2,
        };
    }

    function handleZoom(
        targetX: number,
        targetY: number,
        direct: number,
        scale: number
    ) {
        let imgCenterXY = getImageCenterXY();
        let diffX = targetX - imgCenterXY.x;
        let diffY = targetY - imgCenterXY.y;
        let top = 0;
        let left = 0;
        let width = 0;
        let height = 0;
        let scaleX = 0;
        let scaleY = 0;

        if (state.width === 0) {
            const [imgWidth, imgHeight] = getImgWidthHeight(
                state.imageWidth,
                state.imageHeight
            );
            left = (containerSize.current.width - imgWidth) / 2;
            top = (containerSize.current.height - footerHeight - imgHeight) / 2;
            width = state.width + imgWidth;
            height = state.height + imgHeight;
            scaleX = scaleY = 1;
        } else {
            let directX = state.scaleX > 0 ? 1 : -1;
            let directY = state.scaleY > 0 ? 1 : -1;
            scaleX = state.scaleX + scale * direct * directX;
            scaleY = state.scaleY + scale * direct * directY;
            if (typeof props.maxScale !== "undefined") {
                if (Math.abs(scaleX) > props.maxScale) {
                    scaleX = props.maxScale * directX;
                }
                if (Math.abs(scaleY) > props.maxScale) {
                    scaleY = props.maxScale * directY;
                }
            }
            if (Math.abs(scaleX) < minScale) {
                scaleX = minScale * directX;
            }
            if (Math.abs(scaleY) < minScale) {
                scaleY = minScale * directY;
            }
            top =
                state.top +
                ((-direct * diffY) / state.scaleX) * scale * directX;
            left =
                state.left +
                ((-direct * diffX) / state.scaleY) * scale * directY;
            width = state.width;
            height = state.height;
        }
        dispatch(
            createAction(ACTION_TYPES.update, {
                width: width,
                scaleX: scaleX,
                scaleY: scaleY,
                height: height,
                top: top,
                left: left,
                loading: false,
            })
        );
    }

    return (
        <div className='image-viewer' ref={viewerCore}>
            <ImageViewerCanvas
                image={imageElement}
                fileName={fileName}
                width={state.width}
                height={state.height}
                top={state.top}
                left={state.left}
                rotate={state.rotate}
                onChangeImgState={handleChangeImgState}
                onResize={handleResize}
                scaleX={state.scaleX}
                scaleY={state.scaleY}
                loading={state.loading}
                drag={drag}
                showFileName={state.showFileName}
            />
            {props.noFooter || (
                <div className={"footer" + (!showNavbar ? " no-navbar" : "")}>
                    <div className='box'>
                        {noToolbar || (
                            <ImageViewerToolbar
                                onAction={handleAction}
                                width={state.imageWidth}
                                height={state.imageHeight}
                                showAttributes={showAttributes}
                                zoomable={zoomable}
                                rotatable={rotatable}
                                scalable={scalable}
                                changeable={changeable}
                                noImgDetails={noImgDetails}
                                toolbars={customToolbar(ImageViewerDefaultToolbar)}
                                activeIndex={state.activeIndex}
                                count={filesTotal}
                                showTotal={showTotal}
                                scale={(Math.abs(state.scaleX) + Math.abs(state.scaleY)) / 2}
                                showDownloadButton={allowDownloadFile}
                            />
                        )}
                    </div>
                    {showNavbar && (
                        <ImageViewerNavigation
                            files={props.files || []}
                            activeIndex={state.activeIndex}
                            onChangeImg={handleChangeImg}
                            fileName={fileName}
                        />
                    )}
                </div>
            )}
            {(fileName && state.showFileName) && (
                <div className="file-name">{`${fileName}`}</div>
            )}
        </div>
    );
};
