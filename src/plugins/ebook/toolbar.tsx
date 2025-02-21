import React from 'react';
import { useTranslation } from 'react-i18next';
import {
    TbBook2,
    TbCloudDownload,
    TbLayoutSidebarLeftCollapseFilled,
    TbLayoutSidebarLeftExpandFilled
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
        showDownloadButton = true
    } = props;

    const { t } = useTranslation();

    return (
        <div className='toolbar'>
            <div className='controls'>
                {showSidebar ? (
                    <TbLayoutSidebarLeftCollapseFilled
                        onClick={() => {
                            onAction({ key: 'toc', actionType: ActionType.hide });
                        }}
                        title={t('sidebarToggle')}
                    />
                ) : (
                    <TbLayoutSidebarLeftExpandFilled
                        onClick={() => {
                            onAction({ key: 'toc', actionType: ActionType.show });
                        }}
                        title={t('sidebarToggle')}
                    />
                )}
            </div>
            {showFileName && (
                <div className='file-name'>
                    <TbBook2 />
                    <span>{fileName}</span>
                </div>
            )}
            <div className='controls'>
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
