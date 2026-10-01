// monaco-editor 的 ESM 深层入口没有自带类型声明
declare module 'monaco-editor/esm/vs/editor/edcore.main' {
  export * from 'monaco-editor';
}
