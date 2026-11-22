export const localePresets = [
  "en-GB", "en-US", "en-IE", "en-CA", "en-AU", "bg-BG", "tr-TR", "de-DE", "de-AT", "de-CH",
  "fr-FR", "fr-CA", "fr-CH", "es-ES", "es-MX", "pt-PT", "pt-BR", "it-IT", "nl-NL", "pl-PL",
  "ro-RO", "el-GR", "ru-RU", "uk-UA", "ar-SA", "ar-EG", "hi-IN", "bn-BD", "ja-JP", "ko-KR",
  "zh-CN", "zh-TW", "id-ID", "th-TH", "vi-VN", "he-IL", "fa-IR", "ur-PK", "sr-Latn-RS",
  "hr-HR", "no-NO", "da-DK", "sv-SE", "fi-FI", "cs-CZ", "sk-SK", "hu-HU", "sl-SI", "et-EE",
  "lv-LV", "lt-LT", "is-IS", "ga-IE", "cy-GB", "mt-MT", "sq-AL", "mk-MK", "bs-BA", "hy-AM",
  "ka-GE", "az-AZ", "uz-UZ", "kk-KZ", "sw-KE", "ta-IN", "te-IN", "zh-HK",
] as const
const localeLabels = new Intl.DisplayNames(["en-GB"], { type: "language" })
export const localeOptions: readonly (readonly [string, string])[] = [
  ...localePresets.map(locale => [locale, `${localeLabels.of(locale) ?? locale} · ${locale}`] as const),
  ["custom", "Custom locale tag…"],
]
