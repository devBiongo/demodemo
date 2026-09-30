// Monaco 相关文件集中在此目录：
//   setup.ts               Monaco 初始化（只加载核心 + HTML、worker、本地加载）
//   monaco-esm.d.ts        ESM 深层入口的类型声明
//   RHFCodeEditor.tsx      懒加载入口（对外公开）
//   RHFCodeEditor.impl.tsx 实现（非受控、防抖写回、多 model）
// 外部只从这里 import；setup / impl 只会被懒加载的 chunk 引用。
export * from './RHFCodeEditor';
