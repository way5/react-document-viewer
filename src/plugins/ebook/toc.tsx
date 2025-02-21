import React, { useRef, useState } from 'react';
import { TbArrowBadgeDownFilled, TbArrowBadgeRightFilled, TbDots } from 'react-icons/tb';

/**
 * Anchor Element Props
 *
 * @interface TOCItemProps
 * @typedef {TOCItemProps}
 */
interface TOCItemProps {
    href: string;
    label: string;
    resolveNavigation: (href: string) => void;
    subitems?: TOCItemProps[];
}

/**
 * TOC Nodes props
 *
 * @interface TOCProps
 * @typedef {TOCProps}
 */
interface TOCProps {
    map: Map<number, TOCItemProps>;
    resolveNavigation: (href: string) => void;
}

/**
 * TOC element and subitems
 *
 * @param {TOCItemProps} props
 * @returns {*}
 */
const TOCItem = (props: TOCItemProps) => {
    const [anchorStateExpanded, setAnchorStateExpanded] = useState(false);
    const tocItemRef = useRef<HTMLAnchorElement>(null);

    const ArrowIcon = props.subitems?.length
        ? anchorStateExpanded
            ? TbArrowBadgeDownFilled
            : TbArrowBadgeRightFilled
        : TbDots;

    tocItemRef.current?.addEventListener(
        'click',
        e => {
            e.preventDefault();
            const el = e.target as HTMLAnchorElement;
            const subList = el.parentElement?.querySelector('div.subitems');
            if (subList) {
                if (!anchorStateExpanded) {
                    subList.classList.remove('hidden');
                    setAnchorStateExpanded(true);
                } else {
                    subList.classList.add('hidden');
                    setAnchorStateExpanded(false);
                }
            }
            props.resolveNavigation(props.href);
        },
        true
    );

    return (
        <div className='item'>
            <a href={props.href} ref={tocItemRef}>
                <ArrowIcon />
                {props.label}
            </a>
            {props.subitems?.length ? (
                <div className='subitems hidden'>
                    {props.subitems?.map((item: any, i: number) => {
                        return (
                            <TOCItem
                                key={i}
                                href={item.href}
                                label={item.label}
                                resolveNavigation={props.resolveNavigation}
                            />
                        );
                    })}
                </div>
            ) : (
                ''
            )}
        </div>
    );
};

/**
 * TOC Nodes
 *
 * @class TOC
 * @typedef {TOC}
 * @extends {React.Component<TOCProps>}
 */
class TOC extends React.Component<TOCProps> {
    #tocArray: Map<number, any> = new Map();

    constructor(props: TOCProps) {
        super(props);

        // prepare input
        this.props.map.forEach((v: any, i: number) => {
            if (v !== undefined) {
                const item = v.items[0].item;
                const storageItem = this.#tocArray.get(item.id);
                if (!storageItem) {
                    this.#tocArray.set(item.id, {
                        href: item.href,
                        label: item.label,
                        parent: -1
                    });
                }
                if (item.subitems && item.subitems.length) {
                    item.subitems.forEach((subItem: any) => {
                        const subStorageItem = this.#tocArray.get(subItem.id);
                        if (!subStorageItem) {
                            this.#tocArray.set(subItem.id, {
                                href: subItem.href,
                                label: subItem.label,
                                parent: item.id
                            });
                        }
                    });
                }
            }
        });
    }

    render(): React.ReactNode {
        const nodes: React.ReactNode[] = [];
        this.#tocArray.forEach((v: any, i: number) => {
            if (v.parent === -1) {
                const subitems: TOCItemProps[] = [];
                this.#tocArray.forEach((subv: any, k: number) => {
                    if (subv.parent === i) subitems.push(subv);
                });
                nodes.push(
                    <TOCItem
                        key={i}
                        href={v.href}
                        label={v.label}
                        subitems={subitems}
                        resolveNavigation={this.props.resolveNavigation}
                    />
                );
            }
        });
        return <div className='content'>{nodes}</div>;
    }
}

export default TOC;
