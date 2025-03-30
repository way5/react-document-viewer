import './scss/index.scss';
import 'react-tooltip/dist/react-tooltip.css';
import ReactDocumentViewer from './ReactDocumentViewer';

window.ReactDocumentViewer = ReactDocumentViewer;

if (process.env._ENV === 'development') {
    window.addEventListener('load', () => {
        window.ReactDocumentViewer = new ReactDocumentViewer({
            rootElement: document.getElementById('root'),
            // files: [],
            files: [
                { src: '/docs/test.jpg', name: '', type: '' },
                { src: '/docs/test.webp', name: 'Image #2', type: '' }
            ],
            downloadInNewWindow: false,
            // disablePlugins: ["pdf"],
            // locale: 'es',
            // allowOpenFile: true,
            // noResetZoomAfterChange: true,
            // activeIndex: 0,
            // container: '',
            // drag: false,
            // showAttributes: false,
            // showFileName: false,
            // zoomable: false,
            // rotatable: false,
            // scalable: false,
            // noImgDetails: true,
            noNavbar: false
            // noToolbar: true,
            // noFooter: true,
            // allowLoop: false,
            // changeable: false,
            // customToolbar: () =>{},
            // zoomSpeed: 0.1,
            // defaultSize: { width: 100, height: 200 },
            // disableKeyboardSupport: false,
            // noResetZoomAfterChange: false,
            // noLimitInitializationSize: false,
            // defaultScale: 0.5,
            // disableMouseZoom: false,
            // showTotal: false,
            // maxScale: 1.5,
            // minScale: 0.5,
            // allowDownloadFile: false,
            // pdfWorkerUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.5.136/pdf.worker.mjs'
        });
        window.ReactDocumentViewer.render();
    });
}
