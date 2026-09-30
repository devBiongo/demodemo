import { monaco } from '../../lib/monaco';
import { useEffect, useMemo, useRef, useState } from 'react';
import Editor, { type EditorProps, type OnMount } from '@monaco-editor/react';
import { useController, type FieldPath, type FieldValues } from 'react-hook-form';
import type { editor } from 'monaco-editor';
import type { RHFCodeEditorProps } from './RHFCodeEditor';
import { writeField } from './writeField';

const DEFAULT_OPTIONS: EditorProps['options'] = {
  minimap: { enabled: false },
  fontSize: 13,
  wordWrap: 'on',
  automaticLayout: true,
  scrollBeyondLastLine: false,
};

type Pending = { model: editor.ITextModel; name: string };

/**
 * 非受控的 Monaco 编辑器：
 * - 输入时不触发 React 渲染，按 debounceMs 防抖写回表单；失焦 / 切换 name / 卸载时立即写回
 * - 表单值被外部修改（reset、setValue 等）时同步到编辑器
 * - 切换 path 时复用同一个编辑器实例，只切换 model
 */
export default function RHFCodeEditorImpl<T extends FieldValues>({
  name,
  control,
  height,
  language = 'html',
  path,
  onMount,
  options,
  debounceMs = 300,
}: RHFCodeEditorProps<T>) {
  const { field } = useController({ name, control });
  const formValue: string = field.value ?? '';

  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const [ready, setReady] = useState(false);

  const nameRef = useRef(name);
  nameRef.current = name;
  const pendingRef = useRef<Pending | null>(null);
  const timerRef = useRef<number>();
  /** 已知与该 path 的 model 内容一致的表单值，用于跳过自己写回后引起的同步 */
  const syncedRef = useRef({ path: '', value: '' });
  /** 程序同步 model 时屏蔽 change 监听 */
  const suppressRef = useRef(false);
  const pathsRef = useRef(new Set<string>());
  pathsRef.current.add(path);

  // 只依赖 ref，监听器注册一次即可一直使用
  const flushRef = useRef(() => {
    window.clearTimeout(timerRef.current);
    const pending = pendingRef.current;
    pendingRef.current = null;
    if (!pending || pending.model.isDisposed()) return;
    const value = pending.model.getValue();
    syncedRef.current = { path: pending.model.uri.toString(), value };
    writeField(control, pending.name as FieldPath<T>, value);
  });

  const handleMount: OnMount = (ed, m) => {
    editorRef.current = ed;
    ed.onDidChangeModelContent(() => {
      if (suppressRef.current) return;
      const model = ed.getModel();
      if (!model) return;
      pendingRef.current = { model, name: nameRef.current };
      window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(flushRef.current, debounceMs);
    });
    ed.onDidBlurEditorText(() => flushRef.current());
    setReady(true);
    onMount?.(ed, m);
  };

  // 切换字段或卸载前，先把未写回的内容写回原字段
  useEffect(() => () => flushRef.current(), [name]);

  // 表单值被外部修改 / 切换到其他 path 时，同步到当前 model
  useEffect(() => {
    const model = editorRef.current?.getModel();
    if (!ready || !model) return;
    const modelPath = model.uri.toString();
    if (syncedRef.current.path === modelPath && syncedRef.current.value === formValue) return;
    if (pendingRef.current?.model === model) {
      // 外部修改优先，丢弃尚未写回的输入
      window.clearTimeout(timerRef.current);
      pendingRef.current = null;
    }
    if (model.getValue() !== formValue) {
      suppressRef.current = true;
      model.pushEditOperations([], [{ range: model.getFullModelRange(), text: formValue }], () => null);
      suppressRef.current = false;
    }
    syncedRef.current = { path: modelPath, value: formValue };
  }, [ready, path, formValue]);

  // 卸载时释放本组件创建过的所有 model（等编辑器自身销毁后再做；
  // StrictMode 的模拟卸载后会立即重新挂载，此时跳过）
  const mountedRef = useRef(false);
  useEffect(() => {
    mountedRef.current = true;
    const paths = pathsRef.current;
    return () => {
      mountedRef.current = false;
      window.setTimeout(() => {
        if (mountedRef.current) return;
        paths.forEach((p) => monaco.editor.getModel(monaco.Uri.parse(p))?.dispose());
      });
    };
  }, []);

  const mergedOptions = useMemo(() => ({ ...DEFAULT_OPTIONS, ...options }), [options]);

  return (
    <Editor
      height={height}
      language={language}
      path={path}
      defaultValue={formValue}
      onMount={handleMount}
      options={mergedOptions}
    />
  );
}
