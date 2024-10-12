import * as React from "react";
import { ImageViewerNavProps } from "../../definitions";

/**
 * Navigation block
 *
 * @export
 * @param {ImageViewerNavProps} props
 * @returns {*}
 */
export default function ImageViewerNavigation(props: ImageViewerNavProps) {
    const { activeIndex = 0 } = props;

    function handleChangeImg(newIndex: number) {
        if (activeIndex === newIndex) {
            return;
        }
        props.onChangeImg(newIndex);
    }

    let marginLeft = `calc(-${activeIndex + 1} * 31px)`;
    let listStyle = {
        marginLeft: marginLeft,
    };

    return (
        <div className='navbar'>
            <ul
                className='list list-transition'
                style={listStyle}
            >
                {props.files.map((item, index) => (
                    <li
                        key={index}
                        className={index === activeIndex ? "active" : ""}
                        onClick={() => {
                            handleChangeImg(index);
                        }}
                    >
                        <img src={item.src} alt={props.fileName} />
                    </li>
                ))}
            </ul>
        </div>
    );
}
