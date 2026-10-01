import { lazy, Suspense } from 'react';
import type { DecoupledEditor } from 'ckeditor5';
import type { Control, FieldPath, FieldValues } from 'react-hook-form';
import { EditorFallback } from '../EditorFallback';

export type RHFDocumentEditorProps<T extends FieldValues> = {
  name: FieldPath<T>;
  control: Control<T>;
  /** ツールバーを配置する要素。編集領域はこのコンポーネントの位置に表示される */
  toolbarContainer: HTMLElement | null;
  /** 非活性（読み取り専用） */
  disabled?: boolean;
  /**
   * 表示中かどうか（省略時 true）。false の間はフォームの値を同期せず（非表示中は setData しない）、ツールバーも非活性にする。
   * true に戻った時点で現在のフォームの値を読み込む
   */
  active?: boolean;
  onReady?: (editor: DecoupledEditor) => void;
  /** 編集内容をフォームに書き戻すデバウンス時間（ms）。フォーカスが外れた時 / name 切替 / 非表示 / アンマウント時はすぐに書き戻す */
  debounceMs?: number;
};

const Impl = lazy(() => import('./RHFDocumentEditor.impl'));

/**
 * 遅延読み込みの CKEditor 5（DecoupledEditor）：ツールバーと編集領域を別々の場所に置ける。
 * name が変わっても同じインスタンスを使い、内容だけを入れ替える
 */
export function RHFDocumentEditor<T extends FieldValues>(props: RHFDocumentEditorProps<T>) {
  return (
    <Suspense fallback={<EditorFallback height="100%" />}>
      <Impl {...(props as unknown as RHFDocumentEditorProps<FieldValues>)} />
    </Suspense>
  );
}
