import { useEffect, useRef, useState } from 'react';
import { Box } from '@mui/material';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import { ClassicEditor } from 'ckeditor5';
import { useController, type FieldValues } from 'react-hook-form';
import { writeField } from '../form/writeField';
import { EDITOR_CONFIG } from './config';
import type { RHFRichTextEditorProps } from './RHFRichTextEditor';

const TOOLBAR_HEIGHT = 40;

/**
 * 非活性時はツールバーに inert を付け、クリックもフォーカスもできないようにする
 * （CKEditor の読み取り専用モードではボタンが灰色になるだけで、フォーカスは当たる）。
 * 編集領域には付けない：inert の要素はスクロールもできなくなり、長い本文を読めないため
 */
const applyToolbarDisabled = (editor: ClassicEditor, disabled: boolean) =>
  editor.ui.view.toolbar.element?.toggleAttribute('inert', disabled);

/**
 * 非制御の CKEditor：
 * - 入力中は React のレンダリングを発生させず、debounceMs のデバウンスでフォームに書き戻す（getData は本文全体をシリアライズするため負荷が大きい）
 * - フォーカスが外れた時 / アンマウント時はすぐに書き戻す
 * - フォームの値が外部で変更された（reset、setValue など）ときはエディタに反映する
 */
export default function RHFRichTextEditorImpl<T extends FieldValues>({
  name,
  control,
  height,
  disabled,
  onReady,
  debounceMs = 300,
}: RHFRichTextEditorProps<T>) {
  const { field } = useController({ name, control });
  const formValue: string = field.value ?? '';
  const formValueRef = useRef(formValue);
  formValueRef.current = formValue;

  // CKEditor には初期値としてだけ渡し、以降は変えない
  const [initialData] = useState(formValue);
  const editorRef = useRef<ClassicEditor | null>(null);
  /** エディタの内容と一致していることが分かっているフォームの値 */
  const syncedRef = useRef(formValue);
  const pendingRef = useRef(false);
  const suppressRef = useRef(false);
  const timerRef = useRef<number>();
  const disabledRef = useRef(!!disabled);
  disabledRef.current = !!disabled;

  const flushRef = useRef(() => {
    window.clearTimeout(timerRef.current);
    const editor = editorRef.current;
    if (!pendingRef.current || !editor) return;
    pendingRef.current = false;
    const value = editor.getData();
    syncedRef.current = value;
    writeField(control, name, value);
  });

  /** フォームの値をエディタに反映する（書き戻しは発生させない） */
  const syncFromForm = (editor: ClassicEditor, value: string) => {
    window.clearTimeout(timerRef.current);
    pendingRef.current = false;
    suppressRef.current = true;
    editor.setData(value);
    suppressRef.current = false;
    syncedRef.current = value;
  };

  useEffect(() => {
    const editor = editorRef.current;
    if (editor && formValue !== syncedRef.current) syncFromForm(editor, formValue);
  }, [formValue]);

  // アンマウント前に書き戻す（親の cleanup は CKEditor 自身の破棄より先に実行される）
  useEffect(() => () => flushRef.current(), []);

  useEffect(() => {
    if (editorRef.current) applyToolbarDisabled(editorRef.current, !!disabled);
  }, [disabled]);

  const editableHeight = typeof height === 'number' ? height - TOOLBAR_HEIGHT : `calc(${height} - ${TOOLBAR_HEIGHT}px)`;

  return (
    <Box
      sx={{
        '& .ck-editor__editable_inline': { height: editableHeight, overflowY: 'auto' },
        // 非活性時：他の非活性入力欄と同じ灰色の背景 + 薄い文字
        ...(disabled && {
          '& .ck.ck-editor__main > .ck-editor__editable': { bgcolor: 'grey.100', color: 'text.disabled' },
          '& .ck.ck-toolbar': { bgcolor: 'grey.100' },
        }),
      }}
    >
      <CKEditor
        editor={ClassicEditor}
        config={EDITOR_CONFIG}
        data={initialData}
        disabled={disabled}
        onReady={(editor) => {
          editorRef.current = editor;
          applyToolbarDisabled(editor, disabledRef.current);
          // 読み込み中にフォームの値が変わっている場合がある（例：モード切替で、もう一方のエディタが書き戻した直後）
          if (formValueRef.current !== initialData) syncFromForm(editor, formValueRef.current);
          onReady?.(editor);
        }}
        onChange={() => {
          if (suppressRef.current) return;
          pendingRef.current = true;
          window.clearTimeout(timerRef.current);
          timerRef.current = window.setTimeout(flushRef.current, debounceMs);
        }}
        onBlur={() => flushRef.current()}
        onAfterDestroy={() => {
          editorRef.current = null;
        }}
      />
    </Box>
  );
}
