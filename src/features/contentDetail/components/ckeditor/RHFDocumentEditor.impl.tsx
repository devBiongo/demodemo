import { useEffect, useLayoutEffect, useRef, useState, type MutableRefObject } from 'react';
import { Box } from '@mui/material';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import { DecoupledEditor } from 'ckeditor5';
import { useController, type Control, type FieldPath, type FieldValues } from 'react-hook-form';
import { writeField } from '../form/writeField';
import { EDITOR_CONFIG } from './config';
import type { RHFDocumentEditorProps } from './RHFDocumentEditor';

/**
 * 非制御の CKEditor（DecoupledEditor）：
 * - 入力中は React のレンダリングを発生させず、debounceMs のデバウンスでフォームに書き戻す。フォーカスが外れた時 / name 切替 / 非表示 / アンマウント時はすぐに書き戻す
 * - フォームの値が外部で変更された（reset、setValue など）ときはエディタに反映する（active の間のみ）
 * - name が変わっても同じエディタインスタンスを使い、内容だけを入れ替える
 *
 * react-hook-form 7.55 の useController は name の変化に追従しないため、
 * 項目の値の読み取りは name を key とする FieldBinding で行う（RHFCodeEditor と同じ）。
 */
export default function RHFDocumentEditorImpl<T extends FieldValues>({
  name,
  control,
  toolbarContainer,
  disabled = false,
  active = true,
  onReady,
  debounceMs = 300,
}: RHFDocumentEditorProps<T>) {
  const [editor, setEditor] = useState<DecoupledEditor | null>(null);
  const editorRef = useRef<DecoupledEditor | null>(null);
  const nameRef = useRef(name);
  nameRef.current = name;
  /** 未書き戻しの入力が属する項目 */
  const pendingRef = useRef<string | null>(null);
  const timerRef = useRef<number>();
  /** エディタの内容と一致していることが分かっている [項目, 値]。自分で書き戻したことによる同期をスキップするために使う */
  const syncedRef = useRef({ name: '', value: '' });
  /** プログラムで内容を同期している間は change を無視する */
  const suppressRef = useRef(false);
  // CKEditor には初期値としてだけ渡す（内容は FieldBinding が同期する）
  const [initialData] = useState('');

  // 以下の 2 つの関数は ref にしか依存しないので、一度登録すればずっと使える
  const flushRef = useRef(() => {
    window.clearTimeout(timerRef.current);
    const pending = pendingRef.current;
    pendingRef.current = null;
    const ed = editorRef.current;
    if (!pending || !ed) return;
    const value = ed.getData();
    syncedRef.current = { name: pending, value };
    writeField(control, pending as FieldPath<T>, value);
  });

  /** 現在の項目のフォームの値をエディタに反映する（書き戻しは発生させない） */
  const syncRef = useRef((value: string) => {
    const ed = editorRef.current;
    if (!ed) return;
    const current = nameRef.current;
    if (syncedRef.current.name === current && syncedRef.current.value === value) return;
    // 外部での変更を優先し、未書き戻しの入力は破棄する
    window.clearTimeout(timerRef.current);
    pendingRef.current = null;
    suppressRef.current = true;
    ed.setData(value);
    suppressRef.current = false;
    syncedRef.current = { name: current, value };
  });

  // 項目の切替やアンマウントの前に、未書き戻しの内容を元の項目に書き戻す
  useEffect(() => () => flushRef.current(), [name]);
  // 非表示になったらすぐに書き戻す：layout effect は他のエディタの同期（passive effect）より先に実行される
  useLayoutEffect(() => {
    if (!active) flushRef.current();
  }, [active]);

  // ツールバーを指定の要素に移す
  useEffect(() => {
    const toolbar = editor?.ui.view.toolbar.element;
    if (!toolbar || !toolbarContainer) return;
    toolbarContainer.appendChild(toolbar);
    return () => toolbar.remove();
  }, [editor, toolbarContainer]);

  // 非活性 / 非表示の間はツールバーに inert を付け、クリックもフォーカスもできないようにする
  // （CKEditor の読み取り専用モードではボタンが灰色になるだけで、フォーカスは当たる）
  const readOnly = disabled || !active;
  useEffect(() => {
    editor?.ui.view.toolbar.element?.toggleAttribute('inert', readOnly);
  }, [editor, readOnly]);

  return (
    <Box
      sx={{
        height: '100%',
        // 編集領域の高さを親要素に合わせる（CKEditor が描画する外側の div を経由）。内容が多い場合は内部でスクロール
        '& > div': { height: '100%' },
        '& .ck-editor__editable': {
          height: '100%',
          overflowY: 'auto',
          boxSizing: 'border-box',
          // 非活性：他の非活性の入力欄と同じ灰色の背景 + 薄い文字
          ...(disabled && { bgcolor: 'grey.100', color: 'text.disabled' }),
        },
      }}
    >
      <CKEditor
        editor={DecoupledEditor}
        config={EDITOR_CONFIG}
        data={initialData}
        disabled={readOnly}
        onReady={(ed) => {
          editorRef.current = ed;
          setEditor(ed);
          onReady?.(ed);
        }}
        onChange={() => {
          if (suppressRef.current) return;
          pendingRef.current = nameRef.current;
          window.clearTimeout(timerRef.current);
          timerRef.current = window.setTimeout(flushRef.current, debounceMs);
        }}
        onBlur={() => flushRef.current()}
        onAfterDestroy={() => {
          editorRef.current = null;
          setEditor(null);
        }}
      />
      <FieldBinding key={name} control={control} name={name} enabled={!!editor && active} syncRef={syncRef} />
    </Box>
  );
}

type FieldBindingProps<T extends FieldValues> = {
  control: Control<T>;
  name: FieldPath<T>;
  /** エディタの準備ができていて、表示中 */
  enabled: boolean;
  syncRef: MutableRefObject<(value: string) => void>;
};

/** 1 つの項目の値を購読し、変わったらエディタに反映する。name を key にして使う */
function FieldBinding<T extends FieldValues>({ control, name, enabled, syncRef }: FieldBindingProps<T>) {
  const { field } = useController({ control, name });
  const value: string = field.value ?? '';

  useEffect(() => {
    if (enabled) syncRef.current(value);
  }, [enabled, value, syncRef]);

  return null;
}
