/**
 * vusion-cli 的 vusion test 会默认跑 test 目录下以 .spec.js 结尾的文件，或者 *.vue 中包含 test 标签下的测试代码
 * 只对包含有 test 标签的 vue 文件做处理（否则 webpack 会报一大堆 warning），VUECONTEXT_REPLACER 将被替换为含有
 * test 标签的 *.vue 的 context 引用
 */

/* eslint-disable no-undef */
const testContext = require.context(jsPath, true, /\.spec$/);
testContext.keys().forEach(testContext);

/* VUECONTEXT_REPLACER */
