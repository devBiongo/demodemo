// Monaco の初期化：エディタのコア + HTML 言語だけを読み込み、@monaco-editor/react が CDN ではなくローカルのパッケージを使うようにする。
// 遅延読み込みのエディタモジュールからのみ読み込まれ、初期表示の bundle には含まれない。
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
