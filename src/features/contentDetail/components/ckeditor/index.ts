// CKEditor 5 関連のファイルはこのディレクトリにまとめる：
//   config.ts                  プラグイン・ツールバー・HTML 保持ルール・言語・ライセンス
//   RHFRichTextEditor.tsx      遅延読み込みの入口（外部公開）
//   RHFRichTextEditor.impl.tsx 実装（非制御、デバウンスで書き戻し）
//   RHFDocumentEditor.tsx      遅延読み込みの入口：DecoupledEditor（ツールバーと編集領域を別々に配置）
//   RHFDocumentEditor.impl.tsx 実装（非制御、デバウンスで書き戻し、name 切替時もインスタンスを再利用）
// 外部からはここからのみ import する。config / impl は遅延読み込みの chunk からのみ参照される。
export * from './RHFRichTextEditor';
export * from './RHFDocumentEditor';
