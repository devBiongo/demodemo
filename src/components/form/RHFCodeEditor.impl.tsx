import { monaco } from '../../lib/monaco';
import { useEffect, useMemo, useRef, useState, type MutableRefObject } from 'react';
import Editor, { type EditorProps, type OnMount } from '@monaco-editor/react';
import { useController, type Control, type FieldPath, type FieldValues } from 'react-hook-form';
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
 * - 切换 name/path 时复用同一个编辑器实例，只切换 model
 *
 * 注意：react-hook-form 7.55 的 useController / useWatch 不会跟随 name 的变化
 * （订阅只按首次的 name 建立），所以读取字段值放在以 name 为 key 的 FieldBinding 中，
 * name 变化时 FieldBinding 重新挂载，读到的一定是当前字段的值。
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
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const [ready, setReady] = useState(false);

  const nameRef = useRef(name);
  nameRef.current = name;
  const pendingRef = useRef<Pending | null>(null);
  const timerRef = useRef<number>();
  /** 已知与该 model 内容一致的表单值，用于跳过自己写回后引起的同步 */
  const syncedRef = useRef({ uri: '', value: '' });
  /** 已经用表单值初始化过的 model */
  const initializedRef = useRef(new Set<string>());
  /** 程序同步 model 时屏蔽 change 监听 */
  const suppressRef = useRef(false);
  const pathsRef = useRef(new Set<string>());
  pathsRef.current.add(path);

  // 以下两个函数只依赖 ref，注册一次即可一直使用
  const flushRef = useRef(() => {
    window.clearTimeout(timerRef.current);
    const pending = pendingRef.current;
    pendingRef.current = null;
    if (!pending || pending.model.isDisposed()) return;
    const value = pending.model.getValue();
    syncedRef.current = { uri: pending.model.uri.toString(), value };
    writeField(control, pending.name as FieldPath<T>, value);
  });

  /** 把当前字段的表单值同步到当前 model */
  const syncRef = useRef((value: string) => {
    const model = editorRef.current?.getModel();
    if (!model) return;
    const uri = model.uri.toString();
    if (syncedRef.current.uri === uri && syncedRef.current.value === value) return;
    if (pendingRef.current?.model === model) {
      // 外部修改优先，丢弃尚未写回的输入
      window.clearTimeout(timerRef.current);
      pendingRef.current = null;
    }
    if (model.getValue() !== value) {
      suppressRef.current = true;
      if (initializedRef.current.has(uri)) {
        // 外部修改：作为一次编辑，可撤销
        model.pushEditOperations([], [{ range: model.getFullModelRange(), text: value }], () => null);
      } else {
        // 首次载入：不进入撤销历史
        model.setValue(value);
      }
      suppressRef.current = false;
    }
    initializedRef.current.add(uri);
    syncedRef.current = { uri, value };
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
    <>
      {/* model 由 Editor 按 path 创建（初始为空），内容由 FieldBinding 同步 */}
      <Editor height={height} language={language} path={path} onMount={handleMount} options={mergedOptions} />
      {/* 放在 Editor 之后：其 effect 在 Editor 切换 model 之后执行 */}
      <FieldBinding key={name} control={control} name={name} ready={ready} syncRef={syncRef} />
    </>
  );
}

type FieldBindingProps<T extends FieldValues> = {
  control: Control<T>;
  name: FieldPath<T>;
  ready: boolean;
  syncRef: MutableRefObject<(value: string) => void>;
};

/** 订阅单个字段的值，变化时同步到编辑器。以 name 为 key 使用 */
function FieldBinding<T extends FieldValues>({ control, name, ready, syncRef }: FieldBindingProps<T>) {
  const { field } = useController({ control, name });
  const value: string = field.value ?? '';

  useEffect(() => {
    if (ready) syncRef.current(value);
  }, [ready, value, syncRef]);

  return null;
}
