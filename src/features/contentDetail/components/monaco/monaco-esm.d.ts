// monaco-editor の ESM の深いエントリには型宣言が付属していない
declare module 'monaco-editor/esm/vs/editor/edcore.main' {
  export * from 'monaco-editor';
}
