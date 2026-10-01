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
   * 每个 path 对应一个独立的 model（内容、撤销历史、光标位置）。
   * 切换 name/path 时复用同一个编辑器实例，只切换 model。
   */
  path: string;
  onMount?: OnMount;
  options?: EditorProps['options'];
  /** 非活性（只读） */
  disabled?: boolean;
  /** 编辑内容写回表单的防抖时间（ms）。失焦 / 切换 name / 卸载时会立即写回 */
  debounceMs?: number;
};

const Impl = lazy(() => import('./RHFCodeEditor.impl'));

/** 懒加载 Monaco，首屏和不用编辑器的页面不会加载它 */
export function RHFCodeEditor<T extends FieldValues>(props: RHFCodeEditorProps<T>) {
  return (
    <Suspense fallback={<EditorFallback height={props.height} />}>
      <Impl {...(props as unknown as RHFCodeEditorProps<FieldValues>)} />
    </Suspense>
  );
}
