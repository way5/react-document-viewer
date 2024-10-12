import mammoth from "mammoth";
import React, { useEffect, useState } from "react";
import { ToolbarMS } from "../../components/index";
import { _getBlobUrlFromBuffer, _download } from "../../utils";
import { useTranslation } from "react-i18next";
import { ViewerPluginProps } from "../../definitions";
import { Parser } from "html-to-react";

export default (props: ViewerPluginProps) => {
    const PAGE_WIDTH = 795;
    const PAGE_HIGHT = 1125;
    const {
        fileBuffer,
        activeFile,
        fileType,
        activeIndex,
        changeHandler,
        showFileName,
        allowDownloadFile,
        showLoader = (s) => {},
        showError = (s) => {},
        setOnHideError = (f) => {},
        errorMessage = (m) => {},
        // setFileOpen = () => {},
    } = props;

    const [docHtmlStr, setDocHtmlStr] = useState<string>("");
    const [fileName, setFileName] = useState<string>(activeFile.fileName || "");
    const [file, setFile] = useState(fileBuffer);
    const { t } = useTranslation();
    const [zoomLevel, setZoomLevel] = useState<number>(1);

    useEffect(() => {
        setFileName(activeFile.fileName || "");
    }, [activeIndex]);

    useEffect(() => {
        if (file) {
            showLoader(true);
            loadContent(file);
        }
    }, [file]);

    const loadContent = async (data: Uint8Array) => {
        try {
            let { value } = await mammoth.convertToHtml(
                { arrayBuffer: data },
                {
                    includeDefaultStyleMap: true,
                }
            );
            const div = document.createElement("div");
            div.innerHTML = value;

            // process all a tags so that they open in new tabs
            const domList = div.getElementsByTagName("a");
            Array.from(domList).forEach((item) => {
                item.setAttribute("target", "_blank");
            });
            setDocHtmlStr(div.innerHTML);
        } catch (e) {
            errorMessage(`(!) error loading document: ${e}`);
            showError(true);
            // setFileOpen(false);
        } finally {
            showLoader(false);
            // setFileOpen(true);
        }
    };

    const handleDownload = () => {
        const fileUrl = _getBlobUrlFromBuffer(file, fileType.extension);
        _download(fileUrl, fileName, fileType.extension);
    };

    const onZoomChange = (z: number) => {
        if (z <= 0.5 || z > 2.1) return false;
        setZoomLevel(z);
    };

    return (
        <div className='docx-document'>
            <ToolbarMS
                handleDownload={handleDownload}
                fileName={fileName}
                fileType={fileType.simpleType}
                disabled={!file}
                showFileName={showFileName}
                onZoom={onZoomChange}
                zoom={true}
                zoomLevel={zoomLevel}
                showDownloadButton={allowDownloadFile}
            />
            <div className='scroll'>
                <div
                    className='wrapper'
                    style={{
                        width: zoomLevel * PAGE_WIDTH + "px",
                        minHeight: zoomLevel * PAGE_HIGHT + "px",
                        fontSize: 1 * zoomLevel + "rem",
                    }}
                >
                    <div className='pages'>{Parser().parse(docHtmlStr)}</div>
                </div>
            </div>
        </div>
    );
};
