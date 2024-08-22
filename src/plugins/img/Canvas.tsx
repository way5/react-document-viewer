import React, { useEffect } from "react";
import { ImageViewerCanvasProps } from "../../Definitions";

/**
 * Canvas block
 *
 * @export
 * @param {ImageViewerCanvasProps} props
 * @returns {*}
 */
export default function ImageViewerCanvas(props: ImageViewerCanvasProps) {
    const isMouseDown = React.useRef(false);
    const prePosition = React.useRef({
        x: 0,
        y: 0,
    });

    const [position, setPosition] = React.useState({
        x: 0,
        y: 0,
    });

    useEffect(() => {
        if (props.image) {
            const canvas = document.querySelector(
                "div.canvas"
            ) as HTMLDivElement;
            if (canvas) {
                if (canvas.children.length > 0) {
                    canvas.removeChild(canvas.children[0]);
                }
                const img = props.image;
                const imgStyle = `width:${props.width}px;height:${props.height}px; transform: translateX(${props.left !== null ? props.left + "px" : "aoto"}) translateY(${props.top}px) rotate(${props.rotate}deg) scaleX(${props.scaleX}) scaleY(${props.scaleY})`;
                img.setAttribute(
                    "class",
                    (props.drag ? "draggable" : "") +
                        (isMouseDown.current ? " drag" : "")
                );
                img.setAttribute("style", imgStyle);
                img.addEventListener("mousedown", (e) => handleMouseDown(e));
                img.addEventListener("mouseup", (e) => handleMouseUp(e));
                canvas.appendChild(img);
            } else {
                console.log('(!) unable to find <div class="canvas"> element');
            }
        }
    }, [
        props.image,
        props.width,
        props.height,
        props.top,
        props.left,
        props.rotate,
        props.scaleX,
        props.scaleY,
        props.drag,
    ]);

    useEffect(() => {
        return () => {
            bindEvent(true);
            bindWindowResizeEvent(true);
        };
    }, []);

    useEffect(() => {
        if (props.drag) {
            bindEvent();
            bindWindowResizeEvent();
        }
        return () => {
            bindEvent(true);
        };
    }, [props.drag]);

    useEffect(() => {
        let diffX = position.x - prePosition.current.x;
        let diffY = position.y - prePosition.current.y;
        prePosition.current = {
            x: position.x,
            y: position.y,
        };
        props.onChangeImgState(
            props.width,
            props.height,
            props.top + diffY,
            props.left + diffX
        );
    }, [position]);

    function handleResize(e: Event) {
        props.onResize();
    }

    function handleMouseDown(e: MouseEvent) {
        if (e.button !== 0) {
            return;
        }
        if (!props.drag) {
            return;
        }
        const el = e.target as HTMLElement;
        el.classList.add("drag");
        e.preventDefault();
        e.stopPropagation();
        isMouseDown.current = true;
        prePosition.current = {
            x: e.clientX,
            y: e.clientY,
        };
        e.preventDefault();
    }

    /**
     * Image drag event
     *
     * @param {*} e
     */
    function handleMouseMove(e: MouseEvent) {
        if (isMouseDown.current) {
            e.preventDefault();
            setPosition({
                x: e.clientX,
                y: e.clientY,
            });
        }
    }

    function handleMouseUp(e: MouseEvent) {
        const el = e.target as HTMLElement;
        el.classList.remove("drag");
        isMouseDown.current = false;
    }

    function bindWindowResizeEvent(remove: boolean = false) {
        if (remove) {
            window.removeEventListener("resize", handleResize, false);
            return;
        }
        window.addEventListener("resize", handleResize, false);
    }

    function bindEvent(remove: boolean = false) {
        if (remove) {
            document.removeEventListener("mousemove", handleMouseMove, false);
            return;
        }
        document.addEventListener("mousemove", handleMouseMove, false);
    }

    return <div className='canvas'></div>;
}
