import { lazy, Suspense } from 'react';
import { EditorFallback } from '../EditorFallback';

export type DiffViewerProps = {
  oldValue: string;
  newValue: string;
  /** 语法高亮语言（Prism 语言名，如 html / css / json） */
  language?: string;
  /** 最大高度（px），超出时在内部滚动。默认屏幕高度的一半 */
  maxHeight?: number;
};

const Impl = lazy(() => import('./DiffViewer.impl'));

/** 懒加载的左右对比视图（react-diff-viewer-continued） */
export function DiffViewer(props: DiffViewerProps) {
  return (
    <Suspense fallback={<EditorFallback height={200} />}>
      <Impl {...props} />
    </Suspense>
  );
}
