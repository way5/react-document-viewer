import React from 'react';
import { useTranslation } from 'react-i18next';
import {
    TbBook2,
    TbCloudDownload,
    TbLayoutSidebarLeftCollapseFilled,
    TbLayoutSidebarLeftExpandFilled,
    // TbZoomIn,
    // TbZoomOut,
    // TbZoomReset,
} from 'react-icons/tb';
import { ActionType, EpubToolbarProps } from '../../definitions';

/**
 * Description placeholder
 *
 * @export
 * @param {*} props
 * @returns {*}
 */
export default function EbookViewerToolbar(props: EpubToolbarProps) {
    const {
        onAction,
        fileName,
        fileType,
        disabled,
        showFileName,
        showSidebar = true,
        // zoom,
        // zoomLevel,
        showDownloadButton = true,
    } = props;

    const { t } = useTranslation();

    return (
        <div className='toolbar'>
            <div className='controls'>
                {showSidebar ?
                    (<TbLayoutSidebarLeftCollapseFilled onClick={() => {
                            onAction({ key: 'toc', actionType: ActionType.hide })
                        }}
                        title={t("sidebarToggle")}
                    />) :
                    (<TbLayoutSidebarLeftExpandFilled onClick={() => {
                            onAction({ key: 'toc', actionType: ActionType.show })
                        }}
                        title={t("sidebarToggle")}
                    />)
                }
            </div>
            {showFileName && (
                <div className='file-name'>
                    <TbBook2 />
                    <span>
                        {fileName}
                    </span>
                </div>
            )}
            <div className='controls'>
                {/* {zoom && (
                    <div className='zoom-controls'>
                        <TbZoomReset
                            title={t('resetView')}
                            onClick={() => onAction({ key: 'zoom', actionType: ActionType.reset })}
                        />
                        <TbZoomOut
                            title={t('zoomOut')}
                            onClick={() => onAction({ key: 'zoom', actionType: ActionType.zoomOut })}
                        />
                        <div className='zoom-level'>
                            {Math.trunc(zoomLevel * 100)}%
                        </div>
                        <TbZoomIn
                            title={t('zoomIn')}
                            onClick={() => onAction({ key: 'zoom', actionType: ActionType.zoomIn })}
                        />
                    </div>
                )} */}
                {showDownloadButton && (
                    <TbCloudDownload
                        className={`download${disabled ? ' disabled' : ''}`}
                        title={t('downloadFile')}
                        onClick={() => onAction({ key: 'download', actionType: ActionType.download })}
                    />
                )}
            </div>
        </div>
    );
}
