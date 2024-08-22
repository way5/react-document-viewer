import React from 'react';
import { useTranslation } from 'react-i18next';
import {
    TbCloudDownload,
    TbFileTypeDoc,
    TbFileTypeTxt,
    TbFileTypeXls,
    TbFileUnknown,
    TbZoomIn,
    TbZoomOut,
    TbZoomReset,
} from 'react-icons/tb';
import { ToolbarMSProps } from '../Definitions';

/**
 * Description placeholder
 *
 * @export
 * @param {*} props
 * @returns {*}
 */
export default function ToolbarMS(props: ToolbarMSProps) {
    const {
        fileName,
        fileType,
        handleDownload,
        disabled,
        zoom,
        onZoom,
        showFileName,
        zoomLevel,
        showDownloadButton = true,
    } = props;

    const { t } = useTranslation();

    return (
        <div className='toolbar'>
            {showFileName && (
                <div className='file-name'>
                    {fileType === 'file2003' ? (
                        <TbFileTypeDoc />
                    ) : (fileType === 'file2007' ? (
                        <TbFileTypeXls />
                    ) : (
                        <TbFileUnknown />
                    ))}
                    <span>
                        {fileName}
                    </span>
                </div>
            )}
            <div className='controls'>
                {zoom && (
                    <div className='zoom-controls'>
                        <TbZoomReset
                            title={t('resetView')}
                            onClick={() => onZoom(1)}
                        />
                        <TbZoomOut
                            title={t('zoomOut')}
                            onClick={() => onZoom(zoomLevel - 0.1)}
                        />
                        <div className='zoom-level'>
                            {Math.trunc(zoomLevel * 100)}%
                        </div>
                        <TbZoomIn
                            title={t('zoomIn')}
                            onClick={() => onZoom(zoomLevel + 0.1)}
                        />
                    </div>
                )}
                {showDownloadButton && (
                    <TbCloudDownload
                        className={`download${disabled ? ' disabled' : ''}`}
                        title={t('downloadFile')}
                        onClick={handleDownload}
                    />
                )}
            </div>
        </div>
    );
}
