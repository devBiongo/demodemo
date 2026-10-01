import { useEffect, useLayoutEffect, useRef, useState, type MutableRefObject } from 'react';
import { Box } from '@mui/material';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import { DecoupledEditor } from 'ckeditor5';
import { useController, type Control, type FieldPath, type FieldValues } from 'react-hook-form';
import { writeField } from '../form/writeField';
import { EDITOR_CONFIG } from './config';
import type { RHFDocumentEditorProps } from './RHFDocumentEditor';

/**
 * 非受控的 CKEditor（DecoupledEditor）：
 * - 输入时不触发 React 渲染，按 debounceMs 防抖写回表单；失焦 / 切换 name / 隐藏 / 卸载时立即写回
 * - 表单值被外部修改（reset、setValue 等）时同步到编辑器（仅 active 期间）
 * - 切换 name 时复用同一个编辑器实例，只替换内容
 *
 * react-hook-form 7.55 的 useController 不会跟随 name 的变化，
 * 所以读取字段值放在以 name 为 key 的 FieldBinding 中（与 RHFCodeEditor 相同）。
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
  /** 未写回的输入所属的字段 */
  const pendingRef = useRef<string | null>(null);
  const timerRef = useRef<number>();
  /** 已知与编辑器内容一致的 [字段, 值]，用于跳过自己写回后引起的同步 */
  const syncedRef = useRef({ name: '', value: '' });
  /** 程序同步内容时屏蔽 change 监听 */
  const suppressRef = useRef(false);
  // 只作为初始值传给 CKEditor（内容由 FieldBinding 同步）
  const [initialData] = useState('');

  // 以下两个函数只依赖 ref，注册一次即可一直使用
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

  /** 把当前字段的表单值同步到编辑器（不触发写回） */
  const syncRef = useRef((value: string) => {
    const ed = editorRef.current;
    if (!ed) return;
    const current = nameRef.current;
    if (syncedRef.current.name === current && syncedRef.current.value === value) return;
    // 外部修改优先，丢弃尚未写回的输入
    window.clearTimeout(timerRef.current);
    pendingRef.current = null;
    suppressRef.current = true;
    ed.setData(value);
    suppressRef.current = false;
    syncedRef.current = { name: current, value };
  });

  // 切换字段或卸载前，先把未写回的内容写回原字段
  useEffect(() => () => flushRef.current(), [name]);
  // 隐藏时立即写回：layout effect 先于其他编辑器的同步（passive effect）执行
  useLayoutEffect(() => {
    if (!active) flushRef.current();
  }, [active]);

  // 把工具栏移到指定的元素中
  useEffect(() => {
    const toolbar = editor?.ui.view.toolbar.element;
    if (!toolbar || !toolbarContainer) return;
    toolbarContainer.appendChild(toolbar);
    return () => toolbar.remove();
  }, [editor, toolbarContainer]);

  // 非活性 / 隐藏期间给工具栏加 inert，不能点击也不能获得焦点
  // （CKEditor 的只读模式只会让按钮变灰，仍然可以获得焦点）
  const readOnly = disabled || !active;
  useEffect(() => {
    editor?.ui.view.toolbar.element?.toggleAttribute('inert', readOnly);
  }, [editor, readOnly]);

  return (
    <Box
      sx={{
        height: '100%',
        // 编辑区高度与父元素一致（经过 CKEditor 渲染的外层 div），内容多时在内部滚动
        '& > div': { height: '100%' },
        '& .ck-editor__editable': {
          height: '100%',
          overflowY: 'auto',
          boxSizing: 'border-box',
          // 非活性：与其他非活性输入框相同的灰色背景 + 浅色文字
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
  /** 编辑器就绪且显示中 */
  enabled: boolean;
  syncRef: MutableRefObject<(value: string) => void>;
};

/** 订阅单个字段的值，变化时同步到编辑器。以 name 为 key 使用 */
function FieldBinding<T extends FieldValues>({ control, name, enabled, syncRef }: FieldBindingProps<T>) {
  const { field } = useController({ control, name });
  const value: string = field.value ?? '';

  useEffect(() => {
    if (enabled) syncRef.current(value);
  }, [enabled, value, syncRef]);

  return null;
}
