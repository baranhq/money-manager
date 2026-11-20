# Third-party licences

This inventory covers browser assets, application dependencies and build and test tools. The [complete notices](public/third-party-notices.txt) include copyright notices, licence terms and bundled Next.js notices. The same inventory appears at `/licenses`.

Run `npm run licenses:update` after changing dependencies or third-party assets. `npm run licenses:check` and the production build reject stale records. Review the generated differences, including new licences and distribution obligations.

## Bundled assets and copied source

| Material | Version or source | Licence |
| --- | --- | --- |
| shadcn/ui | [Official New York registry](https://github.com/shadcn-ui/ui) | MIT |
| Geist Sans | [1.9.2](https://github.com/vercel/geist-font) | OFL-1.1 |
| Lucide and Feather icons | [1.76.0](https://github.com/lucide-icons/lucide) | ISC and MIT |

shadcn/ui uses the official New York registry. The [component manifest](notices/vendor/shadcn-ui.json) records the source and SHA-256 of each retrieved registry item. Lucide’s notice includes the Feather MIT attribution. Geist Sans is served from this application’s origin. Additional repository assets are recorded in the [asset manifest](notices/vendor/assets.json).

## Package inventory

| Package | Version | Licence | Scope |
| --- | --- | --- | --- |
| [@alloc/quick-lru](https://www.npmjs.com/package/@alloc/quick-lru/v/5.3.0) | 5.3.0 | MIT | Build or test |
| [@emnapi/core](https://www.npmjs.com/package/@emnapi/core/v/1.11.3) | 1.11.3 | MIT | Platform optional |
| [@emnapi/runtime](https://www.npmjs.com/package/@emnapi/runtime/v/1.11.3) | 1.11.3 | MIT | Platform optional |
| [@emnapi/runtime](https://www.npmjs.com/package/@emnapi/runtime/v/1.11.3) | 1.11.3 | MIT | Platform optional |
| [@emnapi/wasi-threads](https://www.npmjs.com/package/@emnapi/wasi-threads/v/1.2.3) | 1.2.3 | MIT | Platform optional |
| [@floating-ui/core](https://www.npmjs.com/package/@floating-ui/core/v/1.8.0) | 1.8.0 | MIT | Application dependency |
| [@floating-ui/dom](https://www.npmjs.com/package/@floating-ui/dom/v/1.8.0) | 1.8.0 | MIT | Application dependency |
| [@floating-ui/react-dom](https://www.npmjs.com/package/@floating-ui/react-dom/v/2.1.9) | 2.1.9 | MIT | Application dependency |
| [@floating-ui/utils](https://www.npmjs.com/package/@floating-ui/utils/v/0.2.12) | 0.2.12 | MIT | Application dependency |
| [@img/colour](https://www.npmjs.com/package/@img/colour/v/1.1.0) | 1.1.0 | MIT | Platform optional |
| [@img/sharp-darwin-arm64](https://www.npmjs.com/package/@img/sharp-darwin-arm64/v/0.35.5) | 0.35.5 | Apache-2.0 | Platform optional |
| [@img/sharp-darwin-x64](https://www.npmjs.com/package/@img/sharp-darwin-x64/v/0.35.5) | 0.35.5 | Apache-2.0 | Platform optional |
| [@img/sharp-freebsd-wasm32](https://www.npmjs.com/package/@img/sharp-freebsd-wasm32/v/0.35.5) | 0.35.5 | Apache-2.0 | Platform optional |
| [@img/sharp-libvips-darwin-arm64](https://www.npmjs.com/package/@img/sharp-libvips-darwin-arm64/v/1.3.4) | 1.3.4 | LGPL-3.0-or-later | Platform optional |
| [@img/sharp-libvips-darwin-x64](https://www.npmjs.com/package/@img/sharp-libvips-darwin-x64/v/1.3.4) | 1.3.4 | LGPL-3.0-or-later | Platform optional |
| [@img/sharp-libvips-linux-arm](https://www.npmjs.com/package/@img/sharp-libvips-linux-arm/v/1.3.4) | 1.3.4 | LGPL-3.0-or-later | Platform optional |
| [@img/sharp-libvips-linux-arm64](https://www.npmjs.com/package/@img/sharp-libvips-linux-arm64/v/1.3.4) | 1.3.4 | LGPL-3.0-or-later | Platform optional |
| [@img/sharp-libvips-linux-ppc64](https://www.npmjs.com/package/@img/sharp-libvips-linux-ppc64/v/1.3.4) | 1.3.4 | LGPL-3.0-or-later | Platform optional |
| [@img/sharp-libvips-linux-riscv64](https://www.npmjs.com/package/@img/sharp-libvips-linux-riscv64/v/1.3.4) | 1.3.4 | LGPL-3.0-or-later | Platform optional |
| [@img/sharp-libvips-linux-s390x](https://www.npmjs.com/package/@img/sharp-libvips-linux-s390x/v/1.3.4) | 1.3.4 | LGPL-3.0-or-later | Platform optional |
| [@img/sharp-libvips-linux-x64](https://www.npmjs.com/package/@img/sharp-libvips-linux-x64/v/1.3.4) | 1.3.4 | LGPL-3.0-or-later | Platform optional |
| [@img/sharp-libvips-linuxmusl-arm64](https://www.npmjs.com/package/@img/sharp-libvips-linuxmusl-arm64/v/1.3.4) | 1.3.4 | LGPL-3.0-or-later | Platform optional |
| [@img/sharp-libvips-linuxmusl-x64](https://www.npmjs.com/package/@img/sharp-libvips-linuxmusl-x64/v/1.3.4) | 1.3.4 | LGPL-3.0-or-later | Platform optional |
| [@img/sharp-linux-arm](https://www.npmjs.com/package/@img/sharp-linux-arm/v/0.35.5) | 0.35.5 | Apache-2.0 | Platform optional |
| [@img/sharp-linux-arm64](https://www.npmjs.com/package/@img/sharp-linux-arm64/v/0.35.5) | 0.35.5 | Apache-2.0 | Platform optional |
| [@img/sharp-linux-ppc64](https://www.npmjs.com/package/@img/sharp-linux-ppc64/v/0.35.5) | 0.35.5 | Apache-2.0 | Platform optional |
| [@img/sharp-linux-riscv64](https://www.npmjs.com/package/@img/sharp-linux-riscv64/v/0.35.5) | 0.35.5 | Apache-2.0 | Platform optional |
| [@img/sharp-linux-s390x](https://www.npmjs.com/package/@img/sharp-linux-s390x/v/0.35.5) | 0.35.5 | Apache-2.0 | Platform optional |
| [@img/sharp-linux-x64](https://www.npmjs.com/package/@img/sharp-linux-x64/v/0.35.5) | 0.35.5 | Apache-2.0 | Platform optional |
| [@img/sharp-linuxmusl-arm64](https://www.npmjs.com/package/@img/sharp-linuxmusl-arm64/v/0.35.5) | 0.35.5 | Apache-2.0 | Platform optional |
| [@img/sharp-linuxmusl-x64](https://www.npmjs.com/package/@img/sharp-linuxmusl-x64/v/0.35.5) | 0.35.5 | Apache-2.0 | Platform optional |
| [@img/sharp-wasm32](https://www.npmjs.com/package/@img/sharp-wasm32/v/0.35.5) | 0.35.5 | Apache-2.0 AND LGPL-3.0-or-later AND MIT | Platform optional |
| [@img/sharp-webcontainers-wasm32](https://www.npmjs.com/package/@img/sharp-webcontainers-wasm32/v/0.35.5) | 0.35.5 | Apache-2.0 | Platform optional |
| [@img/sharp-win32-arm64](https://www.npmjs.com/package/@img/sharp-win32-arm64/v/0.35.5) | 0.35.5 | Apache-2.0 AND LGPL-3.0-or-later | Platform optional |
| [@img/sharp-win32-ia32](https://www.npmjs.com/package/@img/sharp-win32-ia32/v/0.35.5) | 0.35.5 | Apache-2.0 AND LGPL-3.0-or-later | Platform optional |
| [@img/sharp-win32-x64](https://www.npmjs.com/package/@img/sharp-win32-x64/v/0.35.5) | 0.35.5 | Apache-2.0 AND LGPL-3.0-or-later | Platform optional |
| [@jridgewell/gen-mapping](https://www.npmjs.com/package/@jridgewell/gen-mapping/v/0.3.13) | 0.3.13 | MIT | Build or test |
| [@jridgewell/remapping](https://www.npmjs.com/package/@jridgewell/remapping/v/2.3.5) | 2.3.5 | MIT | Build or test |
| [@jridgewell/resolve-uri](https://www.npmjs.com/package/@jridgewell/resolve-uri/v/3.1.3) | 3.1.3 | MIT | Build or test |
| [@jridgewell/sourcemap-codec](https://www.npmjs.com/package/@jridgewell/sourcemap-codec/v/1.6.0) | 1.6.0 | MIT | Build or test |
| [@jridgewell/trace-mapping](https://www.npmjs.com/package/@jridgewell/trace-mapping/v/0.3.31) | 0.3.31 | MIT | Build or test |
| [@napi-rs/wasm-runtime](https://www.npmjs.com/package/@napi-rs/wasm-runtime/v/1.2.2) | 1.2.2 | MIT | Platform optional |
| [@next/env](https://www.npmjs.com/package/@next/env/v/16.4.6) | 16.4.6 | MIT | Application dependency |
| [@next/swc-darwin-arm64](https://www.npmjs.com/package/@next/swc-darwin-arm64/v/16.4.6) | 16.4.6 | MIT | Platform optional |
| [@next/swc-darwin-x64](https://www.npmjs.com/package/@next/swc-darwin-x64/v/16.4.6) | 16.4.6 | MIT | Platform optional |
| [@next/swc-linux-arm64-gnu](https://www.npmjs.com/package/@next/swc-linux-arm64-gnu/v/16.4.6) | 16.4.6 | MIT | Platform optional |
| [@next/swc-linux-arm64-musl](https://www.npmjs.com/package/@next/swc-linux-arm64-musl/v/16.4.6) | 16.4.6 | MIT | Platform optional |
| [@next/swc-linux-x64-gnu](https://www.npmjs.com/package/@next/swc-linux-x64-gnu/v/16.4.6) | 16.4.6 | MIT | Platform optional |
| [@next/swc-linux-x64-musl](https://www.npmjs.com/package/@next/swc-linux-x64-musl/v/16.4.6) | 16.4.6 | MIT | Platform optional |
| [@next/swc-win32-arm64-msvc](https://www.npmjs.com/package/@next/swc-win32-arm64-msvc/v/16.4.6) | 16.4.6 | MIT | Platform optional |
| [@next/swc-win32-x64-msvc](https://www.npmjs.com/package/@next/swc-win32-x64-msvc/v/16.4.6) | 16.4.6 | MIT | Platform optional |
| [@playwright/test](https://www.npmjs.com/package/@playwright/test/v/1.65.1) | 1.65.1 | Apache-2.0 | Application dependency |
| [@radix-ui/number](https://www.npmjs.com/package/@radix-ui/number/v/1.1.3) | 1.1.3 | MIT | Application dependency |
| [@radix-ui/primitive](https://www.npmjs.com/package/@radix-ui/primitive/v/1.2.0) | 1.2.0 | MIT | Application dependency |
| [@radix-ui/react-accessible-icon](https://www.npmjs.com/package/@radix-ui/react-accessible-icon/v/1.2.0) | 1.2.0 | MIT | Application dependency |
| [@radix-ui/react-accordion](https://www.npmjs.com/package/@radix-ui/react-accordion/v/1.3.1) | 1.3.1 | MIT | Application dependency |
| [@radix-ui/react-alert-dialog](https://www.npmjs.com/package/@radix-ui/react-alert-dialog/v/1.2.1) | 1.2.1 | MIT | Application dependency |
| [@radix-ui/react-arrow](https://www.npmjs.com/package/@radix-ui/react-arrow/v/1.1.17) | 1.1.17 | MIT | Application dependency |
| [@radix-ui/react-aspect-ratio](https://www.npmjs.com/package/@radix-ui/react-aspect-ratio/v/1.2.0) | 1.2.0 | MIT | Application dependency |
| [@radix-ui/react-avatar](https://www.npmjs.com/package/@radix-ui/react-avatar/v/1.3.1) | 1.3.1 | MIT | Application dependency |
| [@radix-ui/react-checkbox](https://www.npmjs.com/package/@radix-ui/react-checkbox/v/1.4.1) | 1.4.1 | MIT | Application dependency |
| [@radix-ui/react-collapsible](https://www.npmjs.com/package/@radix-ui/react-collapsible/v/1.2.1) | 1.2.1 | MIT | Application dependency |
| [@radix-ui/react-collection](https://www.npmjs.com/package/@radix-ui/react-collection/v/1.2.0) | 1.2.0 | MIT | Application dependency |
| [@radix-ui/react-compose-refs](https://www.npmjs.com/package/@radix-ui/react-compose-refs/v/1.1.5) | 1.1.5 | MIT | Application dependency |
| [@radix-ui/react-context](https://www.npmjs.com/package/@radix-ui/react-context/v/1.3.0) | 1.3.0 | MIT | Application dependency |
| [@radix-ui/react-context-menu](https://www.npmjs.com/package/@radix-ui/react-context-menu/v/2.4.1) | 2.4.1 | MIT | Application dependency |
| [@radix-ui/react-dialog](https://www.npmjs.com/package/@radix-ui/react-dialog/v/1.3.1) | 1.3.1 | MIT | Application dependency |
| [@radix-ui/react-direction](https://www.npmjs.com/package/@radix-ui/react-direction/v/1.2.0) | 1.2.0 | MIT | Application dependency |
| [@radix-ui/react-dismissable-layer](https://www.npmjs.com/package/@radix-ui/react-dismissable-layer/v/1.2.1) | 1.2.1 | MIT | Application dependency |
| [@radix-ui/react-dropdown-menu](https://www.npmjs.com/package/@radix-ui/react-dropdown-menu/v/2.2.1) | 2.2.1 | MIT | Application dependency |
| [@radix-ui/react-focus-guards](https://www.npmjs.com/package/@radix-ui/react-focus-guards/v/1.2.0) | 1.2.0 | MIT | Application dependency |
| [@radix-ui/react-focus-scope](https://www.npmjs.com/package/@radix-ui/react-focus-scope/v/1.3.1) | 1.3.1 | MIT | Application dependency |
| [@radix-ui/react-form](https://www.npmjs.com/package/@radix-ui/react-form/v/0.3.0) | 0.3.0 | MIT | Application dependency |
| [@radix-ui/react-hover-card](https://www.npmjs.com/package/@radix-ui/react-hover-card/v/1.2.1) | 1.2.1 | MIT | Application dependency |
| [@radix-ui/react-id](https://www.npmjs.com/package/@radix-ui/react-id/v/1.1.4) | 1.1.4 | MIT | Application dependency |
| [@radix-ui/react-label](https://www.npmjs.com/package/@radix-ui/react-label/v/2.1.17) | 2.1.17 | MIT | Application dependency |
| [@radix-ui/react-menu](https://www.npmjs.com/package/@radix-ui/react-menu/v/2.2.1) | 2.2.1 | MIT | Application dependency |
| [@radix-ui/react-menubar](https://www.npmjs.com/package/@radix-ui/react-menubar/v/1.2.1) | 1.2.1 | MIT | Application dependency |
| [@radix-ui/react-navigation-menu](https://www.npmjs.com/package/@radix-ui/react-navigation-menu/v/1.4.1) | 1.4.1 | MIT | Application dependency |
| [@radix-ui/react-one-time-password-field](https://www.npmjs.com/package/@radix-ui/react-one-time-password-field/v/0.2.1) | 0.2.1 | MIT | Application dependency |
| [@radix-ui/react-password-toggle-field](https://www.npmjs.com/package/@radix-ui/react-password-toggle-field/v/0.2.1) | 0.2.1 | MIT | Application dependency |
| [@radix-ui/react-popover](https://www.npmjs.com/package/@radix-ui/react-popover/v/1.3.1) | 1.3.1 | MIT | Application dependency |
| [@radix-ui/react-popper](https://www.npmjs.com/package/@radix-ui/react-popper/v/1.4.0) | 1.4.0 | MIT | Application dependency |
| [@radix-ui/react-portal](https://www.npmjs.com/package/@radix-ui/react-portal/v/1.2.0) | 1.2.0 | MIT | Application dependency |
| [@radix-ui/react-presence](https://www.npmjs.com/package/@radix-ui/react-presence/v/1.1.11) | 1.1.11 | MIT | Application dependency |
| [@radix-ui/react-primitive](https://www.npmjs.com/package/@radix-ui/react-primitive/v/2.2.0) | 2.2.0 | MIT | Application dependency |
| [@radix-ui/react-progress](https://www.npmjs.com/package/@radix-ui/react-progress/v/1.2.1) | 1.2.1 | MIT | Application dependency |
| [@radix-ui/react-radio-group](https://www.npmjs.com/package/@radix-ui/react-radio-group/v/1.5.1) | 1.5.1 | MIT | Application dependency |
| [@radix-ui/react-roving-focus](https://www.npmjs.com/package/@radix-ui/react-roving-focus/v/1.2.1) | 1.2.1 | MIT | Application dependency |
| [@radix-ui/react-scroll-area](https://www.npmjs.com/package/@radix-ui/react-scroll-area/v/1.4.0) | 1.4.0 | MIT | Application dependency |
| [@radix-ui/react-select](https://www.npmjs.com/package/@radix-ui/react-select/v/2.4.1) | 2.4.1 | MIT | Application dependency |
| [@radix-ui/react-separator](https://www.npmjs.com/package/@radix-ui/react-separator/v/1.2.0) | 1.2.0 | MIT | Application dependency |
| [@radix-ui/react-slider](https://www.npmjs.com/package/@radix-ui/react-slider/v/1.6.1) | 1.6.1 | MIT | Application dependency |
| [@radix-ui/react-slot](https://www.npmjs.com/package/@radix-ui/react-slot/v/1.5.0) | 1.5.0 | MIT | Application dependency |
| [@radix-ui/react-switch](https://www.npmjs.com/package/@radix-ui/react-switch/v/1.4.1) | 1.4.1 | MIT | Application dependency |
| [@radix-ui/react-tabs](https://www.npmjs.com/package/@radix-ui/react-tabs/v/1.2.1) | 1.2.1 | MIT | Application dependency |
| [@radix-ui/react-toast](https://www.npmjs.com/package/@radix-ui/react-toast/v/1.3.1) | 1.3.1 | MIT | Application dependency |
| [@radix-ui/react-toggle](https://www.npmjs.com/package/@radix-ui/react-toggle/v/1.2.1) | 1.2.1 | MIT | Application dependency |
| [@radix-ui/react-toggle-group](https://www.npmjs.com/package/@radix-ui/react-toggle-group/v/1.2.1) | 1.2.1 | MIT | Application dependency |
| [@radix-ui/react-toolbar](https://www.npmjs.com/package/@radix-ui/react-toolbar/v/1.2.1) | 1.2.1 | MIT | Application dependency |
| [@radix-ui/react-tooltip](https://www.npmjs.com/package/@radix-ui/react-tooltip/v/1.4.1) | 1.4.1 | MIT | Application dependency |
| [@radix-ui/react-use-callback-ref](https://www.npmjs.com/package/@radix-ui/react-use-callback-ref/v/1.1.5) | 1.1.5 | MIT | Application dependency |
| [@radix-ui/react-use-controllable-state](https://www.npmjs.com/package/@radix-ui/react-use-controllable-state/v/1.3.0) | 1.3.0 | MIT | Application dependency |
| [@radix-ui/react-use-effect-event](https://www.npmjs.com/package/@radix-ui/react-use-effect-event/v/0.0.5) | 0.0.5 | MIT | Application dependency |
| [@radix-ui/react-use-escape-keydown](https://www.npmjs.com/package/@radix-ui/react-use-escape-keydown/v/1.1.6) | 1.1.6 | MIT | Application dependency |
| [@radix-ui/react-use-is-hydrated](https://www.npmjs.com/package/@radix-ui/react-use-is-hydrated/v/0.1.3) | 0.1.3 | MIT | Application dependency |
| [@radix-ui/react-use-layout-effect](https://www.npmjs.com/package/@radix-ui/react-use-layout-effect/v/1.1.4) | 1.1.4 | MIT | Application dependency |
| [@radix-ui/react-use-previous](https://www.npmjs.com/package/@radix-ui/react-use-previous/v/1.1.4) | 1.1.4 | MIT | Application dependency |
| [@radix-ui/react-use-rect](https://www.npmjs.com/package/@radix-ui/react-use-rect/v/1.1.4) | 1.1.4 | MIT | Application dependency |
| [@radix-ui/react-use-size](https://www.npmjs.com/package/@radix-ui/react-use-size/v/1.1.5) | 1.1.5 | MIT | Application dependency |
| [@radix-ui/react-visually-hidden](https://www.npmjs.com/package/@radix-ui/react-visually-hidden/v/1.2.13) | 1.2.13 | MIT | Application dependency |
| [@radix-ui/rect](https://www.npmjs.com/package/@radix-ui/rect/v/1.1.3) | 1.1.3 | MIT | Application dependency |
| [@swc/helpers](https://www.npmjs.com/package/@swc/helpers/v/0.5.23) | 0.5.23 | Apache-2.0 | Application dependency |
| [@tailwindcss/node](https://www.npmjs.com/package/@tailwindcss/node/v/4.3.5) | 4.3.5 | MIT | Build or test |
| [@tailwindcss/oxide](https://www.npmjs.com/package/@tailwindcss/oxide/v/4.3.5) | 4.3.5 | MIT | Build or test |
| [@tailwindcss/oxide-android-arm64](https://www.npmjs.com/package/@tailwindcss/oxide-android-arm64/v/4.3.5) | 4.3.5 | MIT | Platform optional |
| [@tailwindcss/oxide-darwin-arm64](https://www.npmjs.com/package/@tailwindcss/oxide-darwin-arm64/v/4.3.5) | 4.3.5 | MIT | Platform optional |
| [@tailwindcss/oxide-darwin-x64](https://www.npmjs.com/package/@tailwindcss/oxide-darwin-x64/v/4.3.5) | 4.3.5 | MIT | Platform optional |
| [@tailwindcss/oxide-freebsd-x64](https://www.npmjs.com/package/@tailwindcss/oxide-freebsd-x64/v/4.3.5) | 4.3.5 | MIT | Platform optional |
| [@tailwindcss/oxide-linux-arm-gnueabihf](https://www.npmjs.com/package/@tailwindcss/oxide-linux-arm-gnueabihf/v/4.3.5) | 4.3.5 | MIT | Platform optional |
| [@tailwindcss/oxide-linux-arm64-gnu](https://www.npmjs.com/package/@tailwindcss/oxide-linux-arm64-gnu/v/4.3.5) | 4.3.5 | MIT | Platform optional |
| [@tailwindcss/oxide-linux-arm64-musl](https://www.npmjs.com/package/@tailwindcss/oxide-linux-arm64-musl/v/4.3.5) | 4.3.5 | MIT | Platform optional |
| [@tailwindcss/oxide-linux-x64-gnu](https://www.npmjs.com/package/@tailwindcss/oxide-linux-x64-gnu/v/4.3.5) | 4.3.5 | MIT | Platform optional |
| [@tailwindcss/oxide-linux-x64-musl](https://www.npmjs.com/package/@tailwindcss/oxide-linux-x64-musl/v/4.3.5) | 4.3.5 | MIT | Platform optional |
| [@tailwindcss/oxide-wasm32-wasi](https://www.npmjs.com/package/@tailwindcss/oxide-wasm32-wasi/v/4.3.5) | 4.3.5 | MIT | Platform optional |
| [@tailwindcss/oxide-win32-arm64-msvc](https://www.npmjs.com/package/@tailwindcss/oxide-win32-arm64-msvc/v/4.3.5) | 4.3.5 | MIT | Platform optional |
| [@tailwindcss/oxide-win32-x64-msvc](https://www.npmjs.com/package/@tailwindcss/oxide-win32-x64-msvc/v/4.3.5) | 4.3.5 | MIT | Platform optional |
| [@tailwindcss/postcss](https://www.npmjs.com/package/@tailwindcss/postcss/v/4.3.5) | 4.3.5 | MIT | Build or test |
| [@tybys/wasm-util](https://www.npmjs.com/package/@tybys/wasm-util/v/0.10.3) | 0.10.3 | MIT | Platform optional |
| [@types/node](https://www.npmjs.com/package/@types/node/v/24.19.2) | 24.19.2 | MIT | Build or test |
| [@types/react](https://www.npmjs.com/package/@types/react/v/19.3.0) | 19.3.0 | MIT | Application dependency |
| [@types/react-dom](https://www.npmjs.com/package/@types/react-dom/v/19.3.0) | 19.3.0 | MIT | Application dependency |
| [aria-hidden](https://www.npmjs.com/package/aria-hidden/v/1.2.6) | 1.2.6 | MIT | Application dependency |
| [baseline-browser-mapping](https://www.npmjs.com/package/baseline-browser-mapping/v/2.11.39) | 2.11.39 | Apache-2.0 | Application dependency |
| [caniuse-lite](https://www.npmjs.com/package/caniuse-lite/v/1.0.30001826) | 1.0.30001826 | CC-BY-4.0 | Application dependency |
| [class-variance-authority](https://www.npmjs.com/package/class-variance-authority/v/0.7.1) | 0.7.1 | Apache-2.0 | Application |
| [client-only](https://www.npmjs.com/package/client-only/v/0.0.1) | 0.0.1 | MIT | Application dependency |
| [clsx](https://www.npmjs.com/package/clsx/v/2.1.1) | 2.1.1 | MIT | Application |
| [csstype](https://www.npmjs.com/package/csstype/v/3.2.4) | 3.2.4 | MIT | Application dependency |
| [detect-libc](https://www.npmjs.com/package/detect-libc/v/2.1.2) | 2.1.2 | Apache-2.0 | Application dependency |
| [detect-node-es](https://www.npmjs.com/package/detect-node-es/v/1.1.0) | 1.1.0 | MIT | Application dependency |
| [enhanced-resolve](https://www.npmjs.com/package/enhanced-resolve/v/5.27.0) | 5.27.0 | MIT | Build or test |
| [fake-indexeddb](https://www.npmjs.com/package/fake-indexeddb/v/6.2.7) | 6.2.7 | Apache-2.0 | Build or test |
| [geist](https://www.npmjs.com/package/geist/v/1.9.2) | 1.9.2 | OFL-1.1 | Application |
| [get-nonce](https://www.npmjs.com/package/get-nonce/v/1.0.1) | 1.0.1 | MIT | Application dependency |
| [graceful-fs](https://www.npmjs.com/package/graceful-fs/v/4.2.12) | 4.2.12 | BlueOak-1.0.0 | Build or test |
| [jiti](https://www.npmjs.com/package/jiti/v/2.7.0) | 2.7.0 | MIT | Build or test |
| [lightningcss](https://www.npmjs.com/package/lightningcss/v/1.33.0) | 1.33.0 | MPL-2.0 | Build or test |
| [lightningcss-android-arm64](https://www.npmjs.com/package/lightningcss-android-arm64/v/1.33.0) | 1.33.0 | MPL-2.0 | Platform optional |
| [lightningcss-darwin-arm64](https://www.npmjs.com/package/lightningcss-darwin-arm64/v/1.33.0) | 1.33.0 | MPL-2.0 | Platform optional |
| [lightningcss-darwin-x64](https://www.npmjs.com/package/lightningcss-darwin-x64/v/1.33.0) | 1.33.0 | MPL-2.0 | Platform optional |
| [lightningcss-freebsd-x64](https://www.npmjs.com/package/lightningcss-freebsd-x64/v/1.33.0) | 1.33.0 | MPL-2.0 | Platform optional |
| [lightningcss-linux-arm-gnueabihf](https://www.npmjs.com/package/lightningcss-linux-arm-gnueabihf/v/1.33.0) | 1.33.0 | MPL-2.0 | Platform optional |
| [lightningcss-linux-arm64-gnu](https://www.npmjs.com/package/lightningcss-linux-arm64-gnu/v/1.33.0) | 1.33.0 | MPL-2.0 | Platform optional |
| [lightningcss-linux-arm64-musl](https://www.npmjs.com/package/lightningcss-linux-arm64-musl/v/1.33.0) | 1.33.0 | MPL-2.0 | Platform optional |
| [lightningcss-linux-x64-gnu](https://www.npmjs.com/package/lightningcss-linux-x64-gnu/v/1.33.0) | 1.33.0 | MPL-2.0 | Platform optional |
| [lightningcss-linux-x64-musl](https://www.npmjs.com/package/lightningcss-linux-x64-musl/v/1.33.0) | 1.33.0 | MPL-2.0 | Platform optional |
| [lightningcss-win32-arm64-msvc](https://www.npmjs.com/package/lightningcss-win32-arm64-msvc/v/1.33.0) | 1.33.0 | MPL-2.0 | Platform optional |
| [lightningcss-win32-x64-msvc](https://www.npmjs.com/package/lightningcss-win32-x64-msvc/v/1.33.0) | 1.33.0 | MPL-2.0 | Platform optional |
| [lucide-react](https://www.npmjs.com/package/lucide-react/v/1.76.0) | 1.76.0 | ISC | Application |
| [magic-string](https://www.npmjs.com/package/magic-string/v/1.4.5) | 1.4.5 | MIT | Build or test |
| [nanoid](https://www.npmjs.com/package/nanoid/v/3.3.20) | 3.3.20 | MIT | Application dependency |
| [next](https://www.npmjs.com/package/next/v/16.4.6) | 16.4.6 | MIT | Application |
| [picocolors](https://www.npmjs.com/package/picocolors/v/1.1.1) | 1.1.1 | ISC | Application dependency |
| [playwright](https://www.npmjs.com/package/playwright/v/1.65.1) | 1.65.1 | Apache-2.0 | Application dependency |
| [playwright-core](https://www.npmjs.com/package/playwright-core/v/1.65.1) | 1.65.1 | Apache-2.0 | Application dependency |
| [postcss](https://www.npmjs.com/package/postcss/v/8.5.23) | 8.5.23 | MIT | Application dependency |
| [postcss](https://www.npmjs.com/package/postcss/v/8.5.33) | 8.5.33 | MIT | Build or test |
| [radix-ui](https://www.npmjs.com/package/radix-ui/v/1.8.1) | 1.8.1 | MIT | Application |
| [react](https://www.npmjs.com/package/react/v/19.3.1) | 19.3.1 | MIT | Application |
| [react-dom](https://www.npmjs.com/package/react-dom/v/19.3.1) | 19.3.1 | MIT | Application |
| [react-remove-scroll](https://www.npmjs.com/package/react-remove-scroll/v/2.7.2) | 2.7.2 | MIT | Application dependency |
| [react-remove-scroll-bar](https://www.npmjs.com/package/react-remove-scroll-bar/v/2.3.8) | 2.3.8 | MIT | Application dependency |
| [react-style-singleton](https://www.npmjs.com/package/react-style-singleton/v/2.2.3) | 2.2.3 | MIT | Application dependency |
| [scheduler](https://www.npmjs.com/package/scheduler/v/0.28.0) | 0.28.0 | MIT | Application dependency |
| [semver](https://www.npmjs.com/package/semver/v/7.8.6) | 7.8.6 | ISC | Platform optional |
| [sharp](https://www.npmjs.com/package/sharp/v/0.35.5) | 0.35.5 | Apache-2.0 | Platform optional |
| [source-map-js](https://www.npmjs.com/package/source-map-js/v/1.2.4) | 1.2.4 | BSD-3-Clause | Application dependency |
| [styled-jsx](https://www.npmjs.com/package/styled-jsx/v/5.1.6) | 5.1.6 | MIT | Application dependency |
| [tailwind-merge](https://www.npmjs.com/package/tailwind-merge/v/3.7.0) | 3.7.0 | MIT | Application |
| [tailwindcss](https://www.npmjs.com/package/tailwindcss/v/4.3.5) | 4.3.5 | MIT | Build or test |
| [tapable](https://www.npmjs.com/package/tapable/v/2.3.4) | 2.3.4 | MIT | Build or test |
| [tslib](https://www.npmjs.com/package/tslib/v/2.8.1) | 2.8.1 | 0BSD | Platform optional |
| [tslib](https://www.npmjs.com/package/tslib/v/2.9.1) | 2.9.1 | 0BSD | Application dependency |
| [tw-animate-css](https://www.npmjs.com/package/tw-animate-css/v/1.4.0) | 1.4.0 | MIT | Build or test |
| [typescript](https://www.npmjs.com/package/typescript/v/6.0.3) | 6.0.3 | Apache-2.0 | Build or test |
| [undici-types](https://www.npmjs.com/package/undici-types/v/7.24.6) | 7.24.6 | MIT | Build or test |
| [use-callback-ref](https://www.npmjs.com/package/use-callback-ref/v/1.3.3) | 1.3.3 | MIT | Application dependency |
| [use-sidecar](https://www.npmjs.com/package/use-sidecar/v/1.1.3) | 1.1.3 | MIT | Application dependency |

Platform-specific optional packages are listed from the lockfile. Sharp and libvips are optional server packages for Next.js image optimisation, which this app does not use. If distributing a server image that includes these binaries, review platform-specific bundled notices and corresponding-source and relinking obligations before distribution.
