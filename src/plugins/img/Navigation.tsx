import React, { ReactElement } from 'react';
import { ImageViewerNavProps } from '../../definitions';
import { TbChevronLeftPipe, TbChevronRightPipe, TbPhotoDown } from 'react-icons/tb';
import { useTranslation } from 'react-i18next';
import { Tooltip } from 'react-tooltip';

/**
 * Navigation block
 *
 * @export
 * @param {ImageViewerNavProps} props
 * @returns {*}
 */
export default function ImageViewerNavigation(props: ImageViewerNavProps) {
    const { t } = useTranslation();
    const { activeIndex = 0, thumbWidth = 50, thumbHeight = undefined, thumbSpace = 10 } = props;
    const [listMarginLeft, setListMarginLeft] = React.useState<number>(0);

    React.useEffect(() => {
        if (props.images && props.images[activeIndex]) {
            let margin = (activeIndex + 1) * (thumbWidth + thumbSpace) - thumbWidth / 2;
            setListMarginLeft(margin);
        }
    }, [props.images]);

    function handleChangeImg(newIndex: number) {
        if (activeIndex === newIndex) {
            return;
        }
        props.onChangeImg(newIndex);
    }

    const imagesList = () => {
        let elements: ReactElement[] = [];
        let styles = {};
        if (thumbHeight) styles = { ...styles, height: `${thumbHeight}px` };
        styles = { ...styles, width: `${thumbWidth}px` };
        for (let i = 0; i < props.imagesTotal; i++) {
            let liElement = (
                <li
                    key={i}
                    className={i === activeIndex ? 'active' : ''}
                    style={{ marginLeft: `${thumbSpace}px` }}
                    onClick={e => {
                        handleChangeImg(i);
                    }}>
                    {props.images && props.images[i] ? (
                        <img
                            style={styles}
                            src={props.images[i].src}
                            alt={props.images[i].alt}
                            data-tooltip-id='navbar-tooltip'
                            data-tooltip-content={props.images[i].alt}
                        />
                    ) : (
                        <div
                            className='placeholder'
                            style={styles}
                            data-tooltip-id='navbar-tooltip'
                            data-tooltip-content={t('navbarClickToDownload')}>
                            <TbPhotoDown />
                        </div>
                    )}
                </li>
            );

            elements.push(liElement);
        }
        return elements;
    };

    return (
        <>
            <div className='navbar'>
                <button
                    type='button'
                    className='navbar-goto-first'
                    onClick={e => {
                        handleChangeImg(0);
                    }}
                    disabled={activeIndex === 0}
                    data-tooltip-id='navbar-tooltip'
                    data-tooltip-content={t('gotoFirst')}
                    data-tooltip-place='right'
                    data-tooltip-hidden={activeIndex === 0}>
                    <TbChevronLeftPipe />
                </button>
                <div className='wrapper'>
                    <ul className='list list-transition' style={{ marginLeft: `calc(50% - ${listMarginLeft}px)` }}>
                        {imagesList()}
                    </ul>
                </div>
                <button
                    type='button'
                    className='navbar-goto-last'
                    onClick={e => {
                        handleChangeImg(props.imagesTotal - 1);
                    }}
                    disabled={activeIndex === props.imagesTotal - 1}
                    data-tooltip-id='navbar-tooltip'
                    data-tooltip-content={t('gotoLast')}
                    data-tooltip-place='left'
                    data-tooltip-hidden={activeIndex === props.imagesTotal - 1}>
                    <TbChevronRightPipe />
                </button>
            </div>
            <Tooltip id='navbar-tooltip' />
        </>
    );
}
