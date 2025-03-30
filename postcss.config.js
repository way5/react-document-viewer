module.exports = {
    plugins: {
        'postcss-import': {},
        'tailwindcss/nesting': 'postcss-nesting',
        tailwindcss: {},
        autoprefixer: {}
        // ...(process.env._ENV === 'production' ? { cssnano: {} } : {}),
    }
};
