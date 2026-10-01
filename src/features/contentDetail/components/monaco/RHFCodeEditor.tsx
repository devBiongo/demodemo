import { lazy, Suspense } from 'react';
import type { EditorProps, OnMount } from '@monaco-editor/react';
import type { Control, FieldPath, FieldValues } from 'react-hook-form';
import { EditorFallback } from '../EditorFallback';

export type RHFCodeEditorProps<T extends FieldValues> = {
  name: FieldPath<T>;
  control: Control<T>;
  height: EditorProps['height'];
  language?: string;
  /**
   * path ごとに独立した model（内容・元に戻す履歴・カーソル位置）を持つ。
   * name/path が変わっても同じエディタインスタンスを使い、model だけを切り替える。
   */
  path: string;
  onMount?: OnMount;
  options?: EditorProps['options'];
  /** 非活性（読み取り専用） */
  disabled?: boolean;
  /**
   * 表示中かどうか（省略時 true）。false の間はフォームの値を同期しない（非表示中は内容を書き換えない）。
   * true に戻った時点で現在のフォームの値を読み込む
   */
  active?: boolean;
  /** 編集内容をフォームに書き戻すデバウンス時間（ms）。フォーカスが外れた時 / name 切替 / 非表示 / アンマウント時はすぐに書き戻す */
  debounceMs?: number;
};

const Impl = lazy(() => import('./RHFCodeEditor.impl'));

/** Monaco を遅延読み込みする。初期表示やエディタを使わないページでは読み込まない */
export function RHFCodeEditor<T extends FieldValues>(props: RHFCodeEditorProps<T>) {
  return (
    <Suspense fallback={<EditorFallback height={props.height} />}>
      <Impl {...(props as unknown as RHFCodeEditorProps<FieldValues>)} />
    </Suspense>
  );
}
