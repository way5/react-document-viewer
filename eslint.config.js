import globals from 'globals';
import pluginJs from '@eslint/js';
import pluginReact from 'eslint-plugin-react';

export default [
    {
        ignores: ['dist/**/*'],
        plugins: {
            pluginReact,
        },
    },
    {
        files: ['**/*.{js,mjs,cjs,jsx,tsx,ts}'],
        ...pluginReact.configs.flat.recommended,
    }, 
    {
        languageOptions: {
            ...pluginReact.configs.flat.recommended.languageOptions,
            globals: {
                ...globals.serviceworker,
                ...globals.browser,
            },
            ecmaVersion: 'latest'
        },
        settings: {
            react: {
                version: 'detect'
            }
        },
        rules: {
            'react/jsx-uses-react': 'error',
            'react/jsx-uses-vars': 'error',
        },
    },
    pluginJs.configs.recommended,
    pluginReact.configs.flat.recommended
];
