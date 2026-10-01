import { lazy, Suspense } from 'react';
import { EditorFallback } from '../EditorFallback';

export type DiffViewerProps = {
  oldValue: string;
  newValue: string;
  /** シンタックスハイライトの言語（Prism の言語名。例：html / css / json） */
  language?: string;
  /** 最大の高さ（px）。超える場合は内部でスクロール。既定は画面の高さの半分 */
  maxHeight?: number;
  /** 固定の高さ（px）。指定した場合は内容から見積もらず、内容が少なくてもこの高さを保つ */
  height?: number;
};

const Impl = lazy(() => import('./DiffViewer.impl'));

/** 遅延読み込みの左右比較ビュー（react-diff-viewer-continued） */
export function DiffViewer(props: DiffViewerProps) {
  return (
    <Suspense fallback={<EditorFallback height={props.height ?? 200} />}>
      <Impl {...props} />
    </Suspense>
  );
}
