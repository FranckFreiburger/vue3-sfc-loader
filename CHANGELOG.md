
### [0.2.15](https://github.com/FranckFreiburger/vue3-sfc-loader/compare/v0.2.14...v0.2.15) (2020-12-03)


### Features

* **core:** now, getFile() may return the file content or an object `{ content, extname }` ([292db5f](https://github.com/FranckFreiburger/vue3-sfc-loader/commit/292db5f9cc98d0b9c86588af42278d191add8508))

### [0.2.14](https://github.com/FranckFreiburger/vue3-sfc-loader/compare/v0.2.13...v0.2.14) (2020-11-30)


### Bug Fixes

* **build:** restore @babel/highlight that is required by @babel/code-frame ([c728343](https://github.com/FranckFreiburger/vue3-sfc-loader/commit/c728343e3494c47edad81c9c090bcdbd5b3d0ff8))
* **docs:** fix/enhance "more complete API usage example" example ([61cfe04](https://github.com/FranckFreiburger/vue3-sfc-loader/commit/61cfe04aad90f0fee38cb5296a27062cbea787bc))

### [0.2.13](https://github.com/FranckFreiburger/vue3-sfc-loader/compare/v0.2.12...v0.2.13) (2020-11-30)


### Features

* **build:** add more --env options for bundle build ([1971ac1](https://github.com/FranckFreiburger/vue3-sfc-loader/commit/1971ac123b1c98b22882ba4541375cd0ba7c03fa))


### Bug Fixes

* **core:** in a Vue component, allow missing `<template>`, `<script>` and `<style>` blocks ([3882746](https://github.com/FranckFreiburger/vue3-sfc-loader/commit/3882746cac190199a0809d6d3d4c97af687a7f67))

### [0.2.12](https://github.com/FranckFreiburger/vue3-sfc-loader/compare/v0.2.11...v0.2.12) (2020-11-29)


### Features

* **core:** add code-frame in compilation errors for template, style, SFC script ad imported scripts ([521bea6](https://github.com/FranckFreiburger/vue3-sfc-loader/commit/521bea6f33f75b256ce2e8c28b0e21c4d023c887))

### [0.2.11](https://github.com/FranckFreiburger/vue3-sfc-loader/compare/v0.2.10...v0.2.11) (2020-11-28)


### Features

* **core:** loadModule() throw when a mandatory option is not defined. ([1f62eac](https://github.com/FranckFreiburger/vue3-sfc-loader/commit/1f62eac14972e25833eacb5781b7c9ee7283254c))
* **workflow:** add evalHtmlComments.js tool ([c86208b](https://github.com/FranckFreiburger/vue3-sfc-loader/commit/c86208bb4cd84686d615c74e29977da11c15a9f4))

### [0.2.10](https://github.com/FranckFreiburger/vue3-sfc-loader/compare/v0.2.8...v0.2.10) (2020-11-28)


### Features

* **core:** add code frame in JS code compilation error reports ([caa2d0d](https://github.com/FranckFreiburger/vue3-sfc-loader/commit/caa2d0ddea2d9ea3000afea83f4d457bbdaf4da7))
* **core:** report JS code compilation errors through options.log() ([c806016](https://github.com/FranckFreiburger/vue3-sfc-loader/commit/c8060167b9a74f77efc8b1fe9efb0a20135634cc))

### [0.2.8](https://github.com/FranckFreiburger/vue3-sfc-loader/compare/v0.2.7...v0.2.8) (2020-11-27)


### Bug Fixes

* **core:** add missing scoped option in sfc_compileTemplate() call ([ed99480](https://github.com/FranckFreiburger/vue3-sfc-loader/commit/ed994807f3b294a2fd9a5b98cfd9ac993ffb2fe8))
* **docs:** unpkg.com CDN url ([06f0378](https://github.com/FranckFreiburger/vue3-sfc-loader/commit/06f0378e27d7e03eeac16558d8b8bfcc3d82c584))

### [0.2.7](https://github.com/FranckFreiburger/vue3-sfc-loader/compare/v0.2.3...v0.2.7) (2020-11-27)


### Features

* **core:** export the version of the library ([4e1b1c7](https://github.com/FranckFreiburger/vue3-sfc-loader/commit/4e1b1c705c9454c58783521e877035e93ab19339))

### [0.2.3](https://github.com/FranckFreiburger/vue3-sfc-loader/compare/v0.2.2...v0.2.3) (2020-11-26)

### [0.2.2](https://github.com/FranckFreiburger/vue3-sfc-loader/compare/v0.2.1...v0.2.2) (2020-11-26)

### [0.2.1](https://github.com/FranckFreiburger/vue3-sfc-loader/compare/v0.2.0...v0.2.1) (2020-11-26)


### Bug Fixes

* **workflow:** exclude **/node_modules/ from npm package ([898ec6a](https://github.com/FranckFreiburger/vue3-sfc-loader/commit/898ec6a98eb8267b30b3310ca84413bdf11a0395))

# [0.2.0](https://github.com/FranckFreiburger/vue3-sfc-loader/compare/v0.1.0...v0.2.0) (2020-11-26)


### Features

* **doc:** add package version in the final package (see BannerPlugin) ([484f83e](https://github.com/FranckFreiburger/vue3-sfc-loader/commit/484f83e4a33d013f114ec1818fa212c5ddd0dba0))


### Reverts

* Revert "chore(workflow): enhancements" ([633d9a5](https://github.com/FranckFreiburger/vue3-sfc-loader/commit/633d9a51865fdd658921695b95ec271828b7dce0))
