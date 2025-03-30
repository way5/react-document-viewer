import * as React from 'react';
import { ImageViewerToolbarConfig, ActionType, ImageToolbarProps } from '../../definitions';
import {
    TbActivity,
    TbArrowBigLeft,
    TbArrowBigRight,
    TbArrowsHorizontal,
    TbArrowsVertical,
    TbCloudDownload,
    TbRestore,
    TbRotate2,
    TbRotateClockwise2,
    TbZoomIn,
    TbZoomOut
} from 'react-icons/tb';
import { useTranslation } from 'react-i18next';
import { Tooltip } from 'react-tooltip';

/**
 * Delete toolbar option
 *
 * @param {ImageViewerToolbarConfig[]} toolbars
 * @param {string[]} keys
 * @returns {*}
 */
function deleteToolbarFromKey(toolbars: ImageViewerToolbarConfig[], keys: string[]) {
    const targetToolbar = toolbars.filter(item => keys.indexOf(item.key) < 0);
    return targetToolbar;
}

/**
 * Toolbar block
 *
 * @export
 * @param {ImageToolbarProps} props
 * @returns {*}
 */
export default function ImageViewerToolbar(props: ImageToolbarProps) {
    const { t } = useTranslation();
    function handleAction(config: ImageViewerToolbarConfig) {
        props.onAction(config);
    }

    function renderAction(config: ImageViewerToolbarConfig) {
        let content: any;
        // default toolbar
        if (typeof ActionType[config.actionType] !== 'undefined') {
            content = <TbActivity />;
        }
        switch (config.actionType) {
            case 1: // ZoomIn
                content = <TbZoomIn data-tooltip-id="toolbar-tooltip" data-tooltip-content={t('zoomIn')} />;
                break;
            case 2: // ZoomOut
                content = <TbZoomOut data-tooltip-id="toolbar-tooltip" data-tooltip-content={t('zoomOut')} />;
                break;
            case 3: // prew
                content = <TbArrowBigLeft data-tooltip-id="toolbar-tooltip" data-tooltip-content={t('previous')} />;
                break;
            case 4: // next
                content = <TbArrowBigRight data-tooltip-id="toolbar-tooltip" data-tooltip-content={t('next')} />;
                break;
            case 5: // rotate left
                content = <TbRotate2 data-tooltip-id="toolbar-tooltip" data-tooltip-content={t('pageRotateCcw')} />;
                break;
            case 6: // rotate right
                content = <TbRotateClockwise2 data-tooltip-id="toolbar-tooltip" data-tooltip-content={t('pageRotateCw')} />;
                break;
            case 7: // reset
                content = <TbRestore data-tooltip-id="toolbar-tooltip" data-tooltip-content={t('resetView')} />;
                break;
            // case 8: // close
            //     content = <TbLetterX />;
            //     break;
            case 9: // scale X
                content = <TbArrowsHorizontal data-tooltip-id="toolbar-tooltip" data-tooltip-content={t('flipX')} />;
                break;
            case 10: // scale Y
                content = <TbArrowsVertical data-tooltip-id="toolbar-tooltip" data-tooltip-content={t('flipY')} />;
                break;
            case 11: // download
                content = <TbCloudDownload data-tooltip-id="toolbar-tooltip" data-tooltip-content={t('downloadFile')} />;
                break;
        }
        // extra toolbar
        if (config.render) {
            content = config.render;
        }
        return (
            <li
                key={config.key}
                onClick={() => {
                    handleAction(config);
                }}
                data-key={config.key}>
                {content}
            </li>
        );
    }

    let attributeNode = props.showAttributes ? (
        <div className='attributes'>
            <span>{Math.trunc(props.scale * 100)}%</span>
            <span>{props.noImgDetails || `${props.width} x ${props.height}`}</span>
            <span>{props.showTotal && `${props.activeIndex + 1} ${t('of')} ${props.count}`}</span>
        </div>
    ) : null;

    let toolbars = props.toolbars;
    if (!props.zoomable) {
        toolbars = deleteToolbarFromKey(toolbars, ['zoomIn', 'zoomOut']);
    }
    if (!props.changeable) {
        toolbars = deleteToolbarFromKey(toolbars, ['prev', 'next']);
    }
    if (!props.rotatable) {
        toolbars = deleteToolbarFromKey(toolbars, ['rotateLeft', 'rotateRight']);
    }
    if (!props.scalable) {
        toolbars = deleteToolbarFromKey(toolbars, ['scaleX', 'scaleY']);
    }
    if (!props.showDownloadButton) {
        toolbars = deleteToolbarFromKey(toolbars, ['download']);
    }

    return (
        <div className='toolbar'>
            {attributeNode}
            <ul>
                {toolbars.map(item => {
                    // hide prev / next button if there is nothig to navigate between
                    if (
                        props.count <= 1 &&
                        (item.actionType === ActionType.prev || item.actionType === ActionType.next)
                    ) {
                        return false;
                    }
                    return renderAction(item);
                })}
            </ul>
            <Tooltip id='toolbar-tooltip' />
        </div>
    );
}
