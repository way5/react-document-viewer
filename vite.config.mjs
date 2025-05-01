import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import sassDts from 'vite-plugin-sass-dts';
import { viteStaticCopy } from 'vite-plugin-static-copy';

const isProduction = process.env.NODE_ENV === 'production';

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => ({
    css: {
        preprocessorOptions: {
            scss: {
                api: 'modern'
            }
        }
    },
    plugins: [
        react({}),
        sassDts({
            enabledMode: ['production'],
            sourceDir: path.resolve(__dirname, './src'),
            outputDir: path.resolve(__dirname, './dist')
        }),
        viteStaticCopy({
            targets: [
                {
                    src: './src/scss/index.scss',
                    dest: '',
                    rename: (name, extension, fullPath) => `doc.${extension}`
                },
                {
                    src: './node_modules/pdfjs-dist/build/pdf.worker.mjs',
                    dest: ''
                },
                {
                    src: './node_modules/pdfjs-dist/build/pdf.worker.mjs.map',
                    dest: ''
                },
                {
                    src: './node_modules/pdfjs-dist/cmaps',
                    dest: ''
                },
                {
                    src: './node_modules/pdfjs-dist/cmaps',
                    dest: '../public'
                }
                // {
                //     src: './node_modules/jszip/dist/jszip.js',
                //     dest: '',
                // },
                // {
                //     src: './node_modules/jszip/dist/jszip.js',
                //     dest: '../public',
                // },
            ]
        })
    ],
    build: {
        minify: !isProduction ? false : 'terser',
        cssMinify: !isProduction ? false : 'terser',
        assetsDir: '',
        cssCodeSplit: false,
        reportCompressedSize: false,
        copyPublicDir: false,
        chunkSizeWarningLimit: 1000,
        terserOptions: {
            compress: {
                defaults: true
            },
            ie8: true,
            safari10: true
        },
        rollupOptions: {
            input: {
                app: './index.html'
            },
            output: {
                format: 'umd',
                // manualChunks(id) {
                //     if (id.includes("node_modules")) {
                //         return id
                //             .toString()
                //             .split("node_modules/")[1]
                //             .split("/")[0]
                //             .toString();
                //     }
                // },
                assetFileNames: a => {
                    if (a.names.includes('style.css')) return 'doc.css';
                    else return a.names[0];
                },
                entryFileNames: 'doc_viewer.js'
            },
            onLog(level, log, handler) {
                if (log.cause && log.cause.message === `Can't resolve original location of error.`) {
                    return;
                }
                handler(level, log);
            }
        }
    },
    resolve: {
        alias: {
            lib: path.resolve(__dirname, 'lib')
        }
    },
    define: {
        'process.env': process.env
    }
}));
