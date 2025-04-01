import React, { ReactElement, ReactHTMLElement } from 'react';
import { ImageViewerNavProps } from '../../definitions';
import { TbPhotoDown } from 'react-icons/tb';

/**
 * Navigation block
 *
 * @export
 * @param {ImageViewerNavProps} props
 * @returns {*}
 */
export default function ImageViewerNavigation(props: ImageViewerNavProps) {
    const { activeIndex = 0, thumbWidth = 50, thumbHeight = undefined, thumbSpace = 10 } = props;
    const [listMarginLeft, setListMarginLeft] = React.useState<number>(0);

    React.useEffect(() => {
        if(props.images && props.images[activeIndex]) {
            let margin = ((activeIndex + 1) * (thumbWidth + thumbSpace)) - (thumbWidth/2);
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
        if(thumbHeight)
            styles = { ...styles, height: `${thumbHeight}px` };
        styles = { ...styles, width: `${thumbWidth}px` };
        for (let i = 0; i < props.imagesTotal; i++) {
            let liElement = (
                <li
                    key={i}
                    className={(i === activeIndex) ? 'active' : ''}
                    style={{marginLeft: `${thumbSpace}px`}}
                    onClick={e => {
                        handleChangeImg(i);
                    }}>
                    {props.images && props.images[i] ? (
                        <img style={styles} src={props.images[i].src} alt={props.images[i].alt} />
                    ) : (
                        <div className="placeholder" style={styles} >
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
        <div className='navbar'>
            <ul className='list list-transition' style={{ marginLeft: `calc(50% - ${listMarginLeft}px)` }}>
                {imagesList()}
            </ul>
        </div>
    );
}
