/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ['selector', '[class*="dark"]'],
    mode: 'jit',
    // important: true,
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {}
    },
    plugins: [require('@tailwindcss/forms'), require('@tailwindcss/typography'), require('tailwindcss-animated')]
};
