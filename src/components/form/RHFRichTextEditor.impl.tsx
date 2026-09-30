import { useEffect, useRef, useState } from 'react';
import { Box } from '@mui/material';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import {
  Alignment,
  Bold,
  ClassicEditor,
  Essentials,
  FontBackgroundColor,
  FontColor,
  FontFamily,
  FontSize,
  GeneralHtmlSupport,
  Heading,
  HorizontalLine,
  HtmlComment,
  Image,
  Italic,
  Link,
  List,
  Paragraph,
  RemoveFormat,
  Strikethrough,
  Table,
  TableToolbar,
  Underline,
  type EditorConfig,
} from 'ckeditor5';
import jaTranslations from 'ckeditor5/translations/ja.js';
import 'ckeditor5/ckeditor5.css';
import { useController, type FieldValues } from 'react-hook-form';
import type { RHFRichTextEditorProps } from './RHFRichTextEditor';
import { writeField } from './writeField';

const TOOLBAR_HEIGHT = 40;

const CONFIG: EditorConfig = {
  // TODO: 商用利用の場合は正式なライセンスキーに置き換える
  licenseKey: 'GPL',
  language: 'ja',
  translations: [jaTranslations],
  plugins: [
    Essentials,
    Paragraph,
    Heading,
    Bold,
    Italic,
    Underline,
    Strikethrough,
    RemoveFormat,
    FontSize,
    FontFamily,
    FontColor,
    FontBackgroundColor,
    Alignment,
    List,
    Link,
    Image,
    Table,
    TableToolbar,
    HorizontalLine,
    GeneralHtmlSupport,
    HtmlComment,
  ],
  toolbar: [
    'undo', 'redo', '|',
    'heading', 'fontSize', 'fontColor', 'fontBackgroundColor', '|',
    'bold', 'italic', 'underline', 'strikethrough', 'removeFormat', '|',
    'alignment', 'bulletedList', 'numberedList', '|',
    'link', 'insertTable', 'horizontalLine',
  ],
  table: { contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells'] },
  // 既存 HTML の id / class / style などを保持する。イベント属性（on*）は許可しない
  htmlSupport: {
    allow: [{ name: /.*/, attributes: true, classes: true, styles: true }],
    disallow: [{ attributes: [{ key: /^on/i, value: true }] }],
  },
};

/**
 * 非受控的 CKEditor：
 * - 输入时不触发 React 渲染，按 debounceMs 防抖写回表单（getData 需要序列化整篇内容，开销较大）
 * - 失焦 / 卸载时立即写回
 * - 表单值被外部修改（reset、setValue 等）时同步到编辑器
 */
export default function RHFRichTextEditorImpl<T extends FieldValues>({
  name,
  control,
  height,
  onReady,
  debounceMs = 300,
}: RHFRichTextEditorProps<T>) {
  const { field } = useController({ name, control });
  const formValue: string = field.value ?? '';
  const formValueRef = useRef(formValue);
  formValueRef.current = formValue;

  // 只作为初始值传给 CKEditor，之后不再变化
  const [initialData] = useState(formValue);
  const editorRef = useRef<ClassicEditor | null>(null);
  /** 已知与编辑器内容一致的表单值 */
  const syncedRef = useRef(formValue);
  const pendingRef = useRef(false);
  const suppressRef = useRef(false);
  const timerRef = useRef<number>();

  const flushRef = useRef(() => {
    window.clearTimeout(timerRef.current);
    const editor = editorRef.current;
    if (!pendingRef.current || !editor) return;
    pendingRef.current = false;
    const value = editor.getData();
    syncedRef.current = value;
    writeField(control, name, value);
  });

  /** 把表单值同步进编辑器（不触发写回） */
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

  // 卸载前写回（父组件的 cleanup 先于 CKEditor 自身的销毁执行）
  useEffect(() => () => flushRef.current(), []);

  const editableHeight = typeof height === 'number' ? height - TOOLBAR_HEIGHT : `calc(${height} - ${TOOLBAR_HEIGHT}px)`;

  return (
    <Box sx={{ '& .ck-editor__editable_inline': { height: editableHeight, overflowY: 'auto' } }}>
      <CKEditor
        editor={ClassicEditor}
        config={CONFIG}
        data={initialData}
        onReady={(editor) => {
          editorRef.current = editor;
          // 加载期间表单值可能已被修改（例如切换模式时另一个编辑器刚写回）
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
