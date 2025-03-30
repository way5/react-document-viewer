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
    TbZoomOutArea,
    TbZoomReset
} from 'react-icons/tb';
import { ToolbarMSProps } from '../definitions';
import { Tooltip } from 'react-tooltip';

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
        showDownloadButton = true
    } = props;

    const { t } = useTranslation();

    return (
        <div className='toolbar'>
            {showFileName && (
                <div className='file-name'>
                    {fileType === 'file2003' ? (
                        <TbFileTypeDoc />
                    ) : fileType === 'file2007' ? (
                        <TbFileTypeXls />
                    ) : (
                        <TbFileUnknown />
                    )}
                    {fileName && <span>{fileName}</span>}
                </div>
            )}
            <div className='controls'>
                {zoom && (
                    <div className='zoom-controls'>
                        <TbZoomReset
                            data-tooltip-id='toolbar-tooltip'
                            data-tooltip-content={t('resetView')}
                            data-tooltip-place='bottom'
                            onClick={() => onZoom(1)}
                        />
                        <TbZoomOut
                            data-tooltip-id='toolbar-tooltip'
                            data-tooltip-content={t('zoomOut')}
                            data-tooltip-place='bottom'
                            onClick={() => onZoom(zoomLevel - 0.1)}
                        />
                        <div className='zoom-level'>{Math.trunc(zoomLevel * 100)}%</div>
                        <TbZoomIn
                            data-tooltip-id='toolbar-tooltip'
                            data-tooltip-content={t('zoomIn')}
                            data-tooltip-place='bottom'
                            onClick={() => onZoom(zoomLevel + 0.1)}
                        />
                    </div>
                )}
                {showDownloadButton && (
                    <TbCloudDownload
                        data-tooltip-id='toolbar-tooltip'
                        data-tooltip-content={t('downloadFile')}
                        data-tooltip-place='bottom'
                        className={`download${disabled ? ' disabled' : ''}`}
                        onClick={handleDownload}
                    />
                )}
            </div>
            <Tooltip id='toolbar-tooltip' />
        </div>
    );
}
