import React, { useEffect, useState } from "react";
import { createRoot, Root } from "react-dom/client";
import _PdfViewer from "./plugins/pdf";
import _SheetViewer from "./plugins/msexcel";
import _DocxViewer from "./plugins/msdocx";
import _ImgViewer from "./plugins/img";
import {
    KnownFileTypes,
    getFileTypeFromArrayBuffer,
    getFileTypeFromFileName,
} from "./Utils.js";
import { useTranslation } from "react-i18next";
import i18nInit from "./Locales";
import { ErrorMessage } from "./components/index";
import UnifiedViewerProps, { FileDescriptor } from "./Definitions.js";
import DownloadFile from "./components/Downloader.js";
import Loading from "./components/Loading.js";
import { TbBomb, TbBookOff, TbCloudUpload } from "react-icons/tb";

/**
 * Diable right click
 */
document.oncontextmenu = document.body.oncontextmenu = function () {
    return false;
};

/**
 * All viewers at once
 *
 * @param props
 * @returns
 */
const _AllViewers = (props: UnifiedViewerProps) => {
    const defs: UnifiedViewerProps = {
        fileIdentification: "contents",
        activeIndex: 0,
        rootElement: props.rootElement,
        downloadTimeout: 10000,
        pdfWorkerUrl: "",
        allowOpenFile: false,
        allowDownloadFile: true,
        showFileName: true,
        files: [],
        changeHandler: () => {},
        showLoader: (s: boolean) => {},
    };

    const p = Object.assign(defs, props);

    const {
        files,
        downloadTimeout,
        activeIndex: index,
        allowOpenFile,
        allowDownloadFile,
        fileIdentification,
        showFileName,
    } = p;

    let pdfWorker = props.pdfWorkerUrl;
    if (!pdfWorker || pdfWorker == "") {
        pdfWorker = new URL(
            "/node_modules/pdfjs-dist/build/pdf.worker.mjs",
            import.meta.url
        ).toString() as string;
    }
    // ErrorMessages
    const [showError, setShowError] = useState(false);
    const [errorInfo, setErrorInfo] = useState<string>("");
    const [onHideError, setOnHideError] = useState<any>();
    const [onShowError, setOnShowError] = useState<any>();
    // files
    const [file, setFile] = useState<File | null>();
    const [fileBuffer, setFileBuffer] = useState<Uint8Array | null>(null);
    const [fileIsOpen, setFileIsOpen] = useState<boolean>(false);
    const [fileType, setFileType] = useState<string>("");
    const [fileDescriptor, setFileDescriptor] = useState<FileDescriptor>(
        files[0] || { src: "", fileName: "" }
    );
    const { t } = useTranslation();
    // switching between files
    const [activeIndex, setActiveIndex] = useState<number>(index);
    // loading screen
    const [showLoading, setShowLoading] = useState<boolean>(
        allowOpenFile && !files && !fileBuffer ? true : false
    );

    useEffect(() => {
        if (file instanceof File) {
            // if a new file has been uploaded
            setShowLoading(true);
            file.arrayBuffer().then((bytes) => {
                const arrBuffer = new Uint8Array(bytes);
                const fileType = (
                    fileIdentification === "contents"
                        ? getFileTypeFromArrayBuffer(bytes, null)
                        : getFileTypeFromFileName(file.name)
                ) as string;
                setFileType(fileType);
                setFileBuffer(arrBuffer);
                setFileDescriptor({ src: "", fileName: file.name });
            });
        } else if (files.length) {
            // if inputFiles has changed
            setFileDescriptor(files[activeIndex]);
            DownloadFile({
                files: files,
                fileIdentification: fileIdentification,
                activeIndex: activeIndex,
                downloadTimeout: downloadTimeout,
                onLoad: (arrBuffer, fileType) => {
                    setFileType(fileType);
                    setFileBuffer(arrBuffer);
                },
            });
        }
    }, [files, file, activeIndex]);

    /**
     * Upload file event handler
     * @param e
     */
    const onFlieChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputFileObj = e.target.files?.[0] as File;
        setFile(inputFileObj);
    };

    const StartupStatus = () => {
        let errInfo = "";
        let overlay = null;
        if (fileType == "doc" || fileType == "file2003") {
            errInfo = t("formatInfoDocx");
        } else if (fileType == "ppt" || fileType == "pptx") {
            errInfo = t("formatInfoPPTx");
        } else if (
            fileType == "other" ||
            (!Object.values(KnownFileTypes).includes(fileType as any) &&
                fileType !== "")
        ) {
            errInfo = t("supportFileTypes");
        }

        if (allowOpenFile && !fileIsOpen) {
            const fileOpen = () => {
                const inputElement = document.querySelector(
                    'input[type="file"]'
                ) as HTMLInputElement;
                inputElement.click();
            };

            overlay = (
                <div className='dropzone' onMouseDown={fileOpen}>
                    <TbCloudUpload />
                    <input
                        type='file'
                        className='hidden'
                        onChange={onFlieChange}
                    />
                    <span>{t("uploadFile")}</span>
                </div>
            );
        } else if (!fileIsOpen && files.length == 0) {
            overlay = (
                <div className='no-files-info'>
                    <TbBookOff />
                    {t("noFileSelected")}
                </div>
            );
        } else if (!fileIsOpen && files.length != 0 && errInfo) {
            overlay = (
                <div className='something-wrong-info'>
                    <TbBomb />
                    {t("somethingWrong")}
                </div>
            );
        }

        return (
            <>
                {overlay && (
                    <div className='document-container-overlay'>{overlay}</div>
                )}
                {errInfo ? (
                    <ErrorMessage
                        showError={true}
                        allowCloseButton={false}
                        errorInfo={errInfo}
                    />
                ) : null}
            </>
        );
    };

    return (
        <div className='doc-viewer'>
            {showError && (
                <ErrorMessage
                    showError={showError}
                    errorInfo={errorInfo}
                    onHideError={onHideError}
                    onShowError={onShowError}
                />
            )}
            {/* {Object.values(KnownFileTypes).includes(fileType as any) ? ( */}
            <div className='document-container'>
                {showLoading && !fileIsOpen && <Loading />}
                {fileType == "pdf" && (
                    <_PdfViewer
                        fileBuffer={fileBuffer}
                        fileType={fileType}
                        filesTotal={files.length}
                        activeFile={fileDescriptor}
                        activeIndex={activeIndex}
                        pdfWorkerUrl={pdfWorker}
                        changeHandler={setActiveIndex}
                        showLoader={setShowLoading}
                        showFileName={showFileName}
                        allowDownloadFile={allowDownloadFile}
                        setOnShowError={setOnShowError}
                        setOnHideError={setOnHideError}
                        errorMessage={setErrorInfo}
                        showError={setShowError}
                        setFileOpen={setFileIsOpen}
                    />
                )}
                {(fileType == "xlsx" || fileType == "xls") && (
                    <_SheetViewer
                        fileBuffer={fileBuffer}
                        fileType={fileType}
                        filesTotal={files.length}
                        activeFile={fileDescriptor}
                        activeIndex={activeIndex}
                        changeHandler={setActiveIndex}
                        showLoader={setShowLoading}
                        showFileName={showFileName}
                        allowDownloadFile={allowDownloadFile}
                        setOnShowError={setOnShowError}
                        setOnHideError={setOnHideError}
                        errorMessage={setErrorInfo}
                        showError={setShowError}
                        setFileOpen={setFileIsOpen}
                    />
                )}
                {fileType == "image" && (
                    <_ImgViewer
                        fileBuffer={fileBuffer}
                        fileType={fileType}
                        filesTotal={files.length}
                        activeFile={fileDescriptor}
                        activeIndex={activeIndex}
                        files={files} // TODO: get rid of this artefact
                        drag={props.drag}
                        showAttributes={props.showAttributes}
                        showFileName={showFileName}
                        zoomable={props.zoomable}
                        rotatable={props.rotatable}
                        scalable={props.scalable}
                        changeable={props.changeable}
                        customToolbar={props.customToolbar}
                        zoomSpeed={props.zoomSpeed}
                        disableKeyboardSupport={props.disableKeyboardSupport}
                        noResetZoomAfterChange={props.noResetZoomAfterChange}
                        noLimitInitializationSize={
                            props.noLimitInitializationSize
                        }
                        defaultScale={props.defaultScale}
                        allowLoop={props.allowLoop}
                        disableMouseZoom={props.disableMouseZoom}
                        noImgDetails={props.noImgDetails}
                        noToolbar={props.noToolbar}
                        showTotal={props.showTotal}
                        minScale={props.minScale}
                        changeHandler={setActiveIndex}
                        showLoader={setShowLoading}
                        allowDownloadFile={allowDownloadFile}
                        setOnShowError={setOnShowError}
                        setOnHideError={setOnHideError}
                        errorMessage={setErrorInfo}
                        showError={setShowError}
                        setFileOpen={setFileIsOpen}
                    />
                )}
                {fileType == "docx" && (
                    <_DocxViewer
                        fileBuffer={fileBuffer}
                        fileType={fileType}
                        filesTotal={files.length}
                        activeFile={fileDescriptor}
                        activeIndex={activeIndex}
                        changeHandler={setActiveIndex}
                        showLoader={setShowLoading}
                        showFileName={showFileName}
                        allowDownloadFile={allowDownloadFile}
                        setOnShowError={setOnShowError}
                        setOnHideError={setOnHideError}
                        errorMessage={setErrorInfo}
                        showError={setShowError}
                        setFileOpen={setFileIsOpen}
                    />
                )}
                <StartupStatus />
            </div>
            {/* ) : null} */}
        </div>
    );
};

/**
 * Description placeholder
 *
 * @class ReactDocViewer
 * @typedef {ReactDocViewer}
 */
class ReactDocViewer {
    config: UnifiedViewerProps;
    reactRoot: Root;
    /**
     * Creates an instance of ReactDocViewer.
     *
     * @constructor
     * @param {*} config
     */
    constructor(config: UnifiedViewerProps) {
        this.config = config;
        this.reactRoot = createRoot(this.config.rootElement);
        i18nInit(config.locale || "en");
    }

    /** Description placeholder */
    destroy() {
        this.reactRoot && this.reactRoot.unmount();
    }

    /** Description placeholder */
    render() {
        this.reactRoot.render(<_AllViewers {...this.config} />);
    }
}

export default ReactDocViewer;

export const PdfViewer = _PdfViewer;
export const SheetViewer = _SheetViewer;
export const DocxViewer = _DocxViewer;
export const ImageViewer = _ImgViewer;
export const AllViewers = _AllViewers;
