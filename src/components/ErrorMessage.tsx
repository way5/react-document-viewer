import React, { useEffect, useState } from 'react';
import { TbCircleLetterX } from 'react-icons/tb';
import { ErrorMessageProps } from '../definitions';

export default function ErrorMessage(props: ErrorMessageProps) {
    const {
        showError,
        errorInfo,
        onShowError,
        onHideError = (e) => { },
        allowCloseButton = true
    } = props;

    // const { t } = useTranslation();
    const [msgHidden, setMsgHidden] = useState(!showError);
    const callbackShow = onShowError ? onShowError : () => {};
    const callbackHide = (e: Event) => {
        const msgElement = document.querySelector('.error-line') as HTMLElement;
        msgElement.classList.add('invisible');
        setMsgHidden(true);
        onHideError(e);
    };

    const hideEvent = new Event('closeErrorMessageEvent', {
        bubbles: false,
        cancelable: true,
    });

    window.addEventListener('closeErrorMessageEvent', (e: Event) => {
        callbackHide(e);
    });

    useEffect(() => {
        if (!msgHidden) {
            callbackShow();
        }
    }, [msgHidden]);

    return (
        <div className={'error-line' + (msgHidden ? ' invisible' : '')}>
            <div>{errorInfo}</div>
            {allowCloseButton && (
                <div>
                    <TbCircleLetterX
                        size={25}
                        onMouseDown={(e) => {
                            e.stopPropagation();
                            window.dispatchEvent(hideEvent);
                        }}
                    />
                </div>
            )}
        </div>
    );
}
