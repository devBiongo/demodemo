// Monaco 関連のファイルはこのディレクトリにまとめる：
//   setup.ts               Monaco の初期化（コア + HTML のみ読み込み、worker、ローカル読み込み）
//   monaco-esm.d.ts        ESM の深いエントリの型宣言
//   RHFCodeEditor.tsx      遅延読み込みの入口（外部公開）
//   RHFCodeEditor.impl.tsx 実装（非制御、デバウンスで書き戻し、複数 model）
// 外部からはここからのみ import する。setup / impl は遅延読み込みの chunk からのみ参照される。
export * from './RHFCodeEditor';
