import React from 'react';
import { useTranslation } from 'react-i18next';
import {
    TbBook2,
    TbCloudDownload,
    TbLayoutSidebarLeftCollapseFilled,
    TbLayoutSidebarLeftExpandFilled
} from 'react-icons/tb';
import { ActionType, EpubToolbarProps } from '../../definitions';
import { Tooltip } from 'react-tooltip';

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
                        data-tooltip-id='toolbar-tooltip'
                        data-tooltip-content={t('sidebarToggle')}
                        data-tooltip-place="bottom"
                        onClick={() => {
                            onAction({ key: 'toc', actionType: ActionType.hide });
                        }}
                    />
                ) : (
                    <TbLayoutSidebarLeftExpandFilled
                        data-tooltip-id='toolbar-tooltip'
                        data-tooltip-content={t('sidebarToggle')}
                        data-tooltip-place="bottom"
                        onClick={() => {
                            onAction({ key: 'toc', actionType: ActionType.show });
                        }}
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
                            data-tooltip-id='toolbar-tooltip'
                            data-tooltip-content={t('downloadFile')}
                            data-tooltip-place="bottom"
                            onClick={() => onAction({ key: 'download', actionType: ActionType.download })}
                        />
                )}
            </div>
            <Tooltip id='toolbar-tooltip' />
        </div>
    );
}
