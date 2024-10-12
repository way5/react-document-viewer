import React, { useEffect, useState } from 'react';
import { createRoot, Root } from 'react-dom/client';
import _PdfViewer from './plugins/pdf';
import _SheetViewer from './plugins/msexcel';
import _DocxViewer from './plugins/msdocx';
import _ImgViewer from './plugins/img';
import _EbookViewer from './plugins/epub';
import { getfileTypeExtesions, getFileType } from './utils.js';
import { useTranslation } from 'react-i18next';
import i18nInit from './locales';
import { ErrorMessage } from './components/index';
import UnifiedViewerProps, { FileDescriptor, FileType } from './definitions.js';
import DownloadFile from './components/downloader.js';
import Loading from './components/loading.js';
import { TbBomb, TbBookOff, TbCloudUpload } from 'react-icons/tb';

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
        activeIndex: 0,
        rootElement: props.rootElement,
        downloadTimeout: 10000,
        pdfWorkerUrl: '',
        allowOpenFile: false,
        allowDownloadFile: true,
        showFileName: true,
        files: [],
        disablePlugins: [],
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
        showFileName,
        disablePlugins,
    } = p;

    let errInfo = '';
    let overlay = null;
    let plugin = null;
    let pdfWorker = props.pdfWorkerUrl;
    if (!pdfWorker || pdfWorker == '') {
        pdfWorker = new URL(
            '/node_modules/pdfjs-dist/build/pdf.worker.mjs',
            import.meta.url
        ).toString() as string;
    }
    // ErrorMessages
    const [showError, setShowError] = useState(false);
    const [errorInfo, setErrorInfo] = useState<string>('');
    const [onHideError, setOnHideError] = useState<any>();
    const [onShowError, setOnShowError] = useState<any>();
    // files
    const [file, setFile] = useState<File | null>();
    const [fileBuffer, setFileBuffer] = useState<Uint8Array | null>(null);
    const [fileIsOpen, setFileIsOpen] = useState<boolean>(false);
    const [fileType, setFileType] = useState<FileType>();
    const [fileDescriptor, setFileDescriptor] = useState<FileDescriptor>(files[0] || { src: '', fileName: '' });
    const { t } = useTranslation();
    // switching between files
    const [activeIndex, setActiveIndex] = useState<number>(index);
    // loading screen
    const [showLoading, setShowLoading] = useState<boolean>(true);

    useEffect(() => {
        // if inputFiles has changed
        setFileIsOpen(true);
        setShowLoading(true);

        if (file instanceof File) {
            file.arrayBuffer()
                .then((bytes) => {
                    const arrBuffer = new Uint8Array(bytes);
                    setFileType(getFileType(arrBuffer, file.name, file.type));
                    setFileBuffer(arrBuffer);
                    setFileDescriptor({ src: '', fileName: file.name });
                })
                .catch((err) => {
                    setFileIsOpen(false);
                    setFile(null);
                    setFileBuffer(null);
                    setShowLoading(false);
                });
        } else if (files.length) {
            setFileDescriptor(files[activeIndex]);
            DownloadFile({
                files: files,
                activeIndex: activeIndex,
                downloadTimeout: downloadTimeout,
                onLoadend(arrBuffer, name, type, event) {
                    setFileType(getFileType(arrBuffer, name, type));
                    setFileBuffer(arrBuffer);
                },
                onError: (err) => {
                    // setFileType('');
                    setFileIsOpen(false);
                    setFile(null);
                    setFileBuffer(null);
                    setShowLoading(false);
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

    if (fileType?.simpleType == 'doc' || fileType?.simpleType == 'file2003') {
        errInfo = t('formatInfoDocx');
    } else if (fileType?.simpleType == 'ppt' || fileType?.simpleType == 'pptx') {
        errInfo = t('formatInfoPPTx');
    } else if (fileType?.simpleType == 'other' || (!getfileTypeExtesions(fileType?.extension) && fileType?.simpleType)) {
        errInfo = t('supportFileTypes');
    }

    if (fileType?.simpleType == 'pdf' && !disablePlugins?.includes('pdf')) {
        plugin = (
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
        );
    } else if (
        (fileType?.simpleType == 'xlsx' && !disablePlugins?.includes('msexcel')) ||
        (fileType?.simpleType == 'xls' && !disablePlugins?.includes('excel'))
    ) {
        plugin = (
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
        );
    } else if (fileType?.simpleType == 'image' && !disablePlugins?.includes('images')) {
        plugin = (
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
                noNavbar={props.noNavbar}
                noFooter={props.noFooter}
                disableKeyboardSupport={props.disableKeyboardSupport}
                noResetZoomAfterChange={props.noResetZoomAfterChange}
                noLimitInitializationSize={props.noLimitInitializationSize}
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
        );
    } else if (fileType?.simpleType == 'docx' && !disablePlugins?.includes('msword')) {
        plugin = (
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
        );
    } else if (fileType?.simpleType == 'ebook' && !disablePlugins?.includes('ebook')) {
        plugin = (
            <_EbookViewer
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
        );
    } else if(disablePlugins?.length != 0) {
        errInfo = t('pluginDisabled', { plugins: disablePlugins?.join(', ') });
    }

    if(errInfo != '') {
        if (allowOpenFile ) {
            const fileOpen = () => {
                const inputElement = document.querySelector('input[type="file"]') as HTMLInputElement;
                inputElement.click();
            };

            overlay = (
                <div className="dropzone" onMouseDown={fileOpen}>
                    <TbCloudUpload />
                    <input type="file" className="hidden" onChange={onFlieChange} />
                    <span>{t('uploadFile')}</span>
                </div>
            );
        } else if (files.length == 0) {
            overlay = (
                <div className="no-files-info">
                    <TbBookOff />
                    {t('noFileSelected')}
                </div>
            );
        } else if (files.length != 0) {
            overlay = (
                <div className="something-wrong-info">
                    <TbBomb />
                    {t('somethingWrong')}
                </div>
            );
        }
    }

    return (
        <div className="doc-viewer">
            {showError && (
                <ErrorMessage
                    showError={showError}
                    errorInfo={errorInfo}
                    onHideError={onHideError}
                    onShowError={onShowError}
                />
            )}
            {/* {Object.values(KnownFileTypes).includes(fileType as any) ? ( */}
            <div className="document-container">
                {showLoading && !fileIsOpen && <Loading />}
                {overlay && <div className="document-container-overlay">{overlay}</div>}
                {plugin}
                {errInfo ? <ErrorMessage showError={true} allowCloseButton={false} errorInfo={errInfo} /> : null}
            </div>
            {/* ) : null} */}
        </div>
    );
};

/**
 * Viewer wrapper
 *
 * @class ReactDocumentViewer
 * @typedef {ReactDocumentViewer}
 */
class ReactDocumentViewer {
    config: UnifiedViewerProps;
    reactRoot: Root;
    /**
     * Creates an instance of ReactDocumentViewer.
     *
     * @constructor
     * @param {*} config
     */
    constructor(config: UnifiedViewerProps) {
        this.config = config;
        this.reactRoot = createRoot(this.config.rootElement);
        i18nInit(config.locale || 'en');
    }

    /** destroy root */
    destroy() {
        this.reactRoot && this.reactRoot.unmount();
    }

    /** render viewer */
    render() {
        this.reactRoot.render(<_AllViewers {...this.config} />);
    }
}

export default ReactDocumentViewer;

export const PdfViewer = _PdfViewer;
export const SheetViewer = _SheetViewer;
export const DocxViewer = _DocxViewer;
export const ImageViewer = _ImgViewer;
export const AllViewers = _AllViewers;
