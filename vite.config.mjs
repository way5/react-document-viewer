import path from "node:path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import sassDts from "vite-plugin-sass-dts";
import { viteStaticCopy } from "vite-plugin-static-copy";
// const env = loadEnv(mode, process.cwd(), "");

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => ({
        plugins: [
            react({}),
            sassDts({
                enabledMode: ["development", "production"],
                sourceDir: path.resolve(__dirname, "./src"),
                outputDir: path.resolve(__dirname, "./dist"),
            }),
            viteStaticCopy({
                targets: [
                    {
                        src: './src/scss/index.scss',
                        dest: '',
                        rename: (name, extension, fullPath) => `doc_viewer.${extension}`
                    }, {
                        src: './node_modules/pdfjs-dist/build/pdf.worker.mjs',
                        dest: '',
                    }, {
                        src: './node_modules/pdfjs-dist/build/pdf.worker.mjs.map',
                        dest: '',
                    }, {
                        src: './node_modules/pdfjs-dist/cmaps',
                        dest: '',
                    },
                ],
            }),
        ],
        build: {
            // minify: "terser",
            minify: false,
            cssMinify: "terser",
            assetsDir: "",
            reportCompressedSize: false,
            copyPublicDir: false,
            chunkSizeWarningLimit: 1000,
            terserOptions: {
                compress: {
                    defaults: true,
                },
                ie8: true,
                safari10: true,
            },
            rollupOptions: {
                input: {
                    app: "./index.html",
                },
                output: {
                    format: "umd",
                    // manualChunks(id) {
                    //     if (id.includes("node_modules")) {
                    //         return id
                    //             .toString()
                    //             .split("node_modules/")[1]
                    //             .split("/")[0]
                    //             .toString();
                    //     }
                    // },
                    assetFileNames: (a) => {
                        if (a.name === "index.css") return "doc_viewer.css";
                        else if (a.name === "main.js") return "doc_viewer.js";
                        else if (a.name === "app.scss")
                            return "doc_viewer.scss";
                        else return a.name;
                    },
                    entryFileNames: "doc_viewer.js",
                },
                onLog(level, log, handler) {
                    if (
                        log.cause &&
                        log.cause.message ===
                            `Can't resolve original location of error.`
                    ) {
                        return;
                    }
                    handler(level, log);
                },
            },
        },
        server: {
            port: 8000,
            open: true,
        }
}));
