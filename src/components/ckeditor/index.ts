// CKEditor 5 相关文件集中在此目录：
//   config.ts                  插件・工具栏・HTML 保留规则・语言・许可证
//   RHFRichTextEditor.tsx      懒加载入口（对外公开）
//   RHFRichTextEditor.impl.tsx 实现（非受控、防抖写回）
//   RHFDocumentEditor.tsx      懒加载入口：DecoupledEditor（工具栏与编辑区分开放置）
//   RHFDocumentEditor.impl.tsx 实现（非受控、防抖写回、切换 name 时复用实例）
// 外部只从这里 import；config / impl 只会被懒加载的 chunk 引用。
export * from './RHFRichTextEditor';
export * from './RHFDocumentEditor';
