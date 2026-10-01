// Monaco 初始化：只加载编辑器核心 + HTML 语言，并让 @monaco-editor/react 使用本地包而不是 CDN。
// 只会被懒加载的编辑器模块引入，不进入首屏 bundle。
import { loader } from '@monaco-editor/react';
import * as monaco from 'monaco-editor/esm/vs/editor/edcore.main';
import 'monaco-editor/esm/vs/basic-languages/html/html.contribution';
import 'monaco-editor/esm/vs/language/html/monaco.contribution';
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import HtmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';

self.MonacoEnvironment = {
  getWorker(_workerId, label) {
    if (label === 'html' || label === 'handlebars' || label === 'razor') return new HtmlWorker();
    return new EditorWorker();
  },
};

loader.config({ monaco });

export { monaco };
