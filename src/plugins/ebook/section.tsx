import React from 'react';

/**
 * Description placeholder
 *
 * @interface SectionElementProps
 * @typedef {SectionElementProps}
 */
interface SectionElementProps {
    itemId: number;
    section: { src: string; id: string };
    book: any;
    style?: React.CSSProperties;
    resolveNavigation: (href: any) => void;
    setSectionLength: (index: number, length: number) => void;
}

/**
 * Description placeholder
 *
 * @class SectionElement
 * @typedef {SectionElement}
 * @extends {React.Component<SectionElementProps>}
 */
class SectionElement extends React.Component<SectionElementProps> {
    #root: HTMLIFrameElement | null = null;
    #rootRef: React.RefObject<HTMLIFrameElement> = React.createRef();

    constructor(props: SectionElementProps) {
        super(props);
    }

    componentUpdate(e: Event): void {
        const target = e.target as HTMLIFrameElement;
        const ifrDoc = target.contentDocument || target.contentWindow?.document;
        const ifrHead = ifrDoc?.querySelector('head') as HTMLHeadElement;
        const ifrBody = ifrDoc?.querySelector('body');

        if (ifrBody) {
            ifrHead.innerHTML += `<style>
html, body {
    height: 100% !important;
    width: 100% !important;
}
body {
    box-sizing: border-box !important;
    overflow: hidden !important;
    overflow-wrap: break-word !important;
    position: static !important;
    border: 0px !important;
    padding: 0px;
    margin: 0px !important;
    /* background-color: rgb(249, 250, 251) !important; */
}

img {
    width: 100% !important;
    height: auto !important;
}

p:not(.calibre1):not(.calibre2):not(.calibre3):not(.calibre4):not(.calibre5),
h1,
h2,
h3,
h4,
h5,
h6,
dl,
ul,
table
{
    padding: 0px 3rem !important;
    box-sizing: border-box !important;
}
p::first-child,
h1::first-child,
h2::first-child,
h3::first-child,
h4::first-child,
h5::first-child,
h6::first-child,
dl::first-child
{
    padding-top: 25px !important;
}
</style>`;

            let containerHeight = ifrBody.scrollWidth * 1.42;
            if (containerHeight < ifrBody.scrollHeight) {
                containerHeight = ifrBody.scrollHeight;
            }
            target.setAttribute('style', `height: ${containerHeight}px !important;`);
            this.props.setSectionLength(this.props.itemId, containerHeight);

            ifrDoc?.addEventListener('click', e => {
                const a = (e.target as HTMLElement).closest('a[href]');
                if (!a) return;
                e.preventDefault();
                const href_ = a.getAttribute('href');
                const section = this.props.book.sections[this.props.itemId];
                const href = section.resolveHref?.(href_) ?? href_;
                if (this.props.book.isExternal?.(href)) {
                    Promise.resolve(
                        dispatchEvent(new CustomEvent('external-link', { detail: { a, href }, cancelable: true }))
                    )
                        .then(x => (x ? window.open(href, '_blank')?.focus() : null))
                        .catch(e => {
                            console.error(`failed to dispatch 'external-link': ${e}`);
                        });
                } else {
                    Promise.resolve(dispatchEvent(new CustomEvent('link', { detail: { a, href }, cancelable: true })))
                        .then(x => (x ? this.props.resolveNavigation(href) : null))
                        .catch(e => {
                            console.error(`failed to dispatch 'link': ${e}`);
                        });
                }
            });
        }
    }

    componentDidMount(): void {
        this.#root = this.#rootRef.current as HTMLIFrameElement;
        this.#root.setAttribute('sandbox', 'allow-same-origin allow-scripts');
        this.#root.setAttribute('scrolling', 'no');
        this.#root.setAttribute('exportparts', 'head,foot,filter');

        window.addEventListener('resize', (e: Event) => this.handleResize(e), false);
        this.#root.addEventListener('load', (e: Event) => this.componentUpdate(e), false);
    }

    handleResize(e: Event) {
        if (this.#rootRef.current) {
            const root = this.#rootRef.current as HTMLIFrameElement;
            const document = root.contentDocument || root.contentWindow?.document;
            document?.location.reload();
        }
    }

    componentWillUnmount(): void {
        window.removeEventListener('resize', (e: Event) => this.handleResize(e), false);
        this.#root?.removeEventListener('load', (e: Event) => this.componentUpdate(e), false);
    }

    // componentDidUpdate(): void {}

    render(): JSX.Element {
        return <iframe ref={this.#rootRef} src={this.props.section.src} name={this.props.section.id} />;
    }
}

export default SectionElement;
