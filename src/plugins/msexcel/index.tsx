import "handsontable/dist/handsontable.full.css";
import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { HotTable } from "@handsontable/react";
import { ToolbarMS } from "../../components/index";
import { _getBlobUrlFromBuffer, _download, basename } from "../../utils";
import { useTranslation } from "react-i18next";
import { ViewerPluginProps } from "../../definitions";


export default (props: ViewerPluginProps) => {
    const {
        fileBuffer,
        activeFile,
        fileType,
        activeIndex,
        changeHandler,
        allowDownloadFile,
        showFileName,
        showLoader = (s) => {},
        showError = (s) => {},
        setOnHideError = (f) => { },
        setOnShowError = (f) => {},
        errorMessage = (m) => { },
        // setFileOpen = () => {},
    } = props;
    const [data, setData] = useState<Record<string, any>>({});
    const [file, setFile] = useState(fileBuffer);
    const [fileName, setFileName] = useState<string>('');
    const { t } = useTranslation();
    const [activeTabKey, setActiveTabKey] = useState<string>("wbSheets_0");
    const [sheetNames, setSheetNames] = useState<string[]>([]);
    const [zoomLevel, setZoomLevel] = useState<number>(1);

    useEffect(() => {
        setFile(fileBuffer);
    }, [fileBuffer]);

    useEffect(() => {
        setFileName(activeFile.name || basename(activeFile.src));
    }, [activeIndex]);

    useEffect(() => {
        if (file) {
            Error(false);
            showLoader(true);
            try {
                const workbook = XLSX.read(file, { type: "buffer" });
                loadData(workbook);
            } catch (e: any) {
                Error(true, e);
            }
        }
    }, [file]);

    const Error = (status: boolean, info: string = '') => {
        showLoader(false);
        showError(status);
        if (info === '') {
            info = t('msexcelGenericError');
        }
        errorMessage(info);
    };

    const loadData = (workbook: XLSX.WorkBook) => {
        const names = workbook.SheetNames;
        if (names && names.length > 0) {
            setSheetNames(names);
            setActiveTabKey("wbSheets_0");
        }
        names.forEach(function (sheetName, idx) {
            const subDivId = "wbSheets_" + idx;
            var json = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
                header: "A",
                blankrows: false,
            });
            setData((data) => {
                return {
                    ...data,
                    [subDivId]: json,
                };
            });
        });
        showLoader(false);
        // setFileOpen(true);
    };

    const onChangeTab = (e: React.MouseEvent<Element, MouseEvent>, subDivId: string) => {
        e.preventDefault();
        setActiveTabKey(subDivId);
    };

    const handleDownload = () => {
        const fileUrl = _getBlobUrlFromBuffer(file, fileType.extension);
        _download(fileUrl, fileName, fileType.extension);
    };

    return (
        <div id='wbSheets_wrapper_id' className='wbsheets-document'>
            <ToolbarMS
                fileName={fileName}
                fileType={fileType.simpleType}
                showFileName={showFileName}
                handleDownload={handleDownload}
                disabled={!file}
                zoom={false}
                onZoom={setZoomLevel}
                zoomLevel={zoomLevel}
                showDownloadButton={allowDownloadFile}
            />
            <HotTable
                licenseKey='non-commercial-and-evaluation'
                settings={{
                    data: data[activeTabKey],
                    colHeaders:true,
                    rowHeaders: true,
                    fixedColumnsLeft: 0,
                    fixedRowsTop: 0,
                    stretchH: 'all',
                    // colWidths: 200,
                    // startRows: 1,
                    // startCols: 1,
                    // wordWrap: true,
                    // autoRowSize: true,
                    // autoWrapRow: true,
                    // autoWrapCol: true,
                    dropdownMenu: true,
                    // multiColumnSorting: true,
                    // autoColumnSize: {
                    //     syncLimit: 60,
                    //     useHeaders: true,
                    // },
                    // filters: true,
                    // manualRowMove: true,
                    // allowInsertColumn: true,
                    // allowInsertRow: true,
                    // allowRemoveColumn: true,
                    // allowRemoveRow: true,
                    // fillHandle: true,
                    contextMenu: true,
                    width: '100%',
                    height: '100%'
                }}
            />
            <ul className='wbsheets-tablist'>
                {sheetNames.map((item, index) => (
                    <li
                        className={
                            activeTabKey == "wbSheets_" + index
                                ? "selected"
                                : ""
                        }
                        key={sheetNames[index]}
                    >
                        <a
                            href={"wbSheets_" + index}
                            onClick={(e) => onChangeTab(e, `wbSheets_${index}`)}
                        >
                            {item}
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );
};
