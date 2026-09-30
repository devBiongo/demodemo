import { lazy, Suspense } from 'react';
import type { ClassicEditor } from 'ckeditor5';
import type { Control, FieldPath, FieldValues } from 'react-hook-form';
import { EditorFallback } from '../EditorFallback';

export type RHFRichTextEditorProps<T extends FieldValues> = {
  name: FieldPath<T>;
  control: Control<T>;
  height: number | string;
  onReady?: (editor: ClassicEditor) => void;
  /** 编辑内容写回表单的防抖时间（ms）。失焦 / 卸载时会立即写回 */
  debounceMs?: number;
};

const Impl = lazy(() => import('./RHFRichTextEditor.impl'));

/** 懒加载的 CKEditor 5（WYSIWYG）。name 变化时重新创建编辑器 */
export function RHFRichTextEditor<T extends FieldValues>(props: RHFRichTextEditorProps<T>) {
  return (
    <Suspense fallback={<EditorFallback height={props.height} />}>
      <Impl key={props.name} {...(props as unknown as RHFRichTextEditorProps<FieldValues>)} />
    </Suspense>
  );
}
