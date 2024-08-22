import globals from "globals";
import pluginJs from "@eslint/js";
import pluginReact from "eslint-plugin-react";
import reactRecommended from "eslint-plugin-react/configs/recommended.js";


export default [
    {
        ignores: ["./dist/**/*"],
      },
    {
        files: ["**/*.{js,mjs,cjs,jsx}"],
        ignores: ["dist/**/*"],
        ...reactRecommended,
        settings: {
            react: {
                version: "detect"
            }
        },
  },
    {
        languageOptions: {
            ...reactRecommended.languageOptions,
            globals: globals.browser,
            ecmaVersion: "latest",
        }
    },
  pluginJs.configs.recommended,
  pluginReact.configs.flat.recommended
];