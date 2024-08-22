/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: "selector",
    mode: "jit",
    important: true,
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {},
    },
    plugins: [
        require("tailwindcss/colors"),
        // require("@tailwindcss/forms"),
        require("postcss-import"),
        require("postcss-nesting"),
        require("tailwindcss/nesting"),
        require("tailwindcss-animated"),
        require("@tailwindcss/typography"),
    ],
};
