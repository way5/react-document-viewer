import React from 'react';

interface SectionMarkerProps {
    itemId: number;
    href: string;
    label: string;
    style: React.CSSProperties;
}

class SectionMarker extends React.Component<SectionMarkerProps> {
    #ref: React.RefObject<HTMLAnchorElement> = React.createRef();

    constructor(props: any) {
        super(props);
    }

    componentDidMount(): void {
        const el = this.#ref.current as HTMLAnchorElement;
        el.addEventListener('click', e => {
            e.preventDefault();
            const needle = document.querySelector(`[name="${this.props.href}"]`);
            needle?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    }

    render(): React.ReactNode {
        return (
            <a href={this.props.href} style={this.props.style} className='section-mark group' ref={this.#ref}>
                {this.props.label && (
                    <div className='tooltip__text'>
                        <div className='hidden group-hover:block'>{this.props.label}</div>
                    </div>
                )}
            </a>
        );
    }
}

export default SectionMarker;
