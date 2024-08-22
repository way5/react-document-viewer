import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { default as enUs } from "./locales/en-US.json";
import { default as esEs } from "./locales/es-ES.json";
import { default as ruRu } from "./locales/ru-RU.json";
import { default as zhCn } from "./locales/zh-CN.json";

// See: https://www.i18next.com/overview/configuration-options
const i18nInit = (lng: string) => {
    i18n.use(initReactI18next).init({
        resources: {
            en: {
                translation: enUs,
            },
            es: {
                translation: esEs,
            },
            ru: {
                translation: ruRu,
            },
            zh: {
                translation: zhCn,
            },
        },
        lng: lng,
        fallbackLng: "en",
        debug: false,
        react: {
            bindI18n: "languageChanged",
            bindI18nStore: "",
            transEmptyNodeValue: "",
            transSupportBasicHtmlNodes: true,
            transKeepBasicHtmlNodesFor: ["br", "strong", "i"],
            useSuspense: true,
        },
    });

    return i18n;
};

export default i18nInit;
