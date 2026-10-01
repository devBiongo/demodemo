import { lazy, Suspense } from 'react';
import type { ClassicEditor } from 'ckeditor5';
import type { Control, FieldPath, FieldValues } from 'react-hook-form';
import { EditorFallback } from '../EditorFallback';

export type RHFRichTextEditorProps<T extends FieldValues> = {
  name: FieldPath<T>;
  control: Control<T>;
  height: number | string;
  /** 非活性（読み取り専用） */
  disabled?: boolean;
  onReady?: (editor: ClassicEditor) => void;
  /** 編集内容をフォームに書き戻すデバウンス時間（ms）。フォーカスが外れた時 / アンマウント時はすぐに書き戻す */
  debounceMs?: number;
};

const Impl = lazy(() => import('./RHFRichTextEditor.impl'));

/** 遅延読み込みの CKEditor 5（WYSIWYG）。name が変わるとエディタを作り直す */
export function RHFRichTextEditor<T extends FieldValues>(props: RHFRichTextEditorProps<T>) {
  return (
    <Suspense fallback={<EditorFallback height={props.height} />}>
      <Impl key={props.name} {...(props as unknown as RHFRichTextEditorProps<FieldValues>)} />
    </Suspense>
  );
}
