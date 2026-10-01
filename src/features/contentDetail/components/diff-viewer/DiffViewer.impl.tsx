import { useMemo } from 'react';
import ReactDiffViewer, { DiffMethod, type ReactDiffViewerStylesOverride } from 'react-diff-viewer-continued';
import type { DiffViewerProps } from './DiffViewer';

const LINE_HEIGHT = 18;
/** 每行的估算高度（行高 + 上下留白） */
const ROW_HEIGHT = LINE_HEIGHT + 2;
/** 顶部摘要栏（展开/折叠按钮、变更数） */
const SUMMARY_HEIGHT = 32;

const STYLES: ReactDiffViewerStylesOverride = {
  contentText: { fontSize: 12, lineHeight: `${LINE_HEIGHT}px` },
  lineNumber: { fontSize: 12 },
};

const countLines = (s: string) => (s ? s.split('\n').length : 1);

export default function DiffViewerImpl({ oldValue, newValue, language, maxHeight, height }: DiffViewerProps) {
  // 虚拟滚动：只渲染可见范围内的行，行数再多 DOM 数量也基本固定。
  // 容器高度是固定的，未指定 height 时按行数估算，内容少时不留大片空白；最高不超过 maxHeight（默认屏幕高度的一半）
  const infiniteLoading = useMemo(() => {
    if (height !== undefined) return { pageSize: 50, containerHeight: `${height}px` };
    const limit = maxHeight ?? Math.round(window.innerHeight / 2);
    const estimated = Math.max(countLines(oldValue), countLines(newValue)) * ROW_HEIGHT + SUMMARY_HEIGHT;
    return {
      // 类型上必填，当前版本的实现中并未使用
      pageSize: 50,
      containerHeight: `${Math.min(estimated, limit)}px`,
    };
  }, [oldValue, newValue, maxHeight, height]);

  return (
    <ReactDiffViewer
      oldValue={oldValue}
      newValue={newValue}
      splitView
      compareMethod={DiffMethod.LINES}
      // 默认显示全文；可用左上角的按钮折叠未变更的行
      showDiffOnly={false}
      highlightLanguage={language}
      styles={STYLES}
      infiniteLoading={infiniteLoading}
    />
  );
}
