import { useMemo } from 'react';
import ReactDiffViewer, { DiffMethod, type ReactDiffViewerStylesOverride } from 'react-diff-viewer-continued';
import type { DiffViewerProps } from './DiffViewer';

const LINE_HEIGHT = 18;
/** 1 行の推定の高さ（行の高さ + 上下の余白） */
const ROW_HEIGHT = LINE_HEIGHT + 2;
/** 上部のサマリーバー（展開 / 折りたたみボタン、変更数） */
const SUMMARY_HEIGHT = 32;

const STYLES: ReactDiffViewerStylesOverride = {
  contentText: { fontSize: 12, lineHeight: `${LINE_HEIGHT}px` },
  lineNumber: { fontSize: 12 },
};

const countLines = (s: string) => (s ? s.split('\n').length : 1);

export default function DiffViewerImpl({ oldValue, newValue, language, maxHeight, height }: DiffViewerProps) {
  // 仮想スクロール：表示範囲の行だけをレンダリングするので、行数が多くても DOM の数はほぼ一定。
  // コンテナの高さは固定なので、height の指定がない場合は行数から見積もり、内容が少ない時に大きな余白を残さない。最大でも maxHeight（既定は画面の高さの半分）
  const infiniteLoading = useMemo(() => {
    if (height !== undefined) return { pageSize: 50, containerHeight: `${height}px` };
    const limit = maxHeight ?? Math.round(window.innerHeight / 2);
    const estimated = Math.max(countLines(oldValue), countLines(newValue)) * ROW_HEIGHT + SUMMARY_HEIGHT;
    return {
      // 型の上では必須だが、現在のバージョンの実装では使われていない
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
      // 既定では全文を表示する。左上のボタンで変更のない行を折りたためる
      showDiffOnly={false}
      highlightLanguage={language}
      styles={STYLES}
      infiniteLoading={infiniteLoading}
    />
  );
}
