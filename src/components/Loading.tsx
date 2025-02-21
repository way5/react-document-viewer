import React from 'react';
import { TbLoader } from 'react-icons/tb';

export default function Loading() {
    return (
        <div className='loading-page'>
            <div className='spinner'>
                <TbLoader size={40} />
            </div>
        </div>
    );
}
