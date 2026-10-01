import { lazy, Suspense } from 'react';
import type { DecoupledEditor } from 'ckeditor5';
import type { Control, FieldPath, FieldValues } from 'react-hook-form';
import { EditorFallback } from '../EditorFallback';

export type RHFDocumentEditorProps<T extends FieldValues> = {
  name: FieldPath<T>;
  control: Control<T>;
  /** 放置工具栏的元素。编辑区显示在本组件所在的位置 */
  toolbarContainer: HTMLElement | null;
  /** 非活性（只读） */
  disabled?: boolean;
  /**
   * 是否显示中（默认 true）。false 期间不同步表单值（隐藏时不 setData），工具栏也变为非活性；
   * 变回 true 时读取一次当前表单值
   */
  active?: boolean;
  onReady?: (editor: DecoupledEditor) => void;
  /** 编辑内容写回表单的防抖时间（ms）。失焦 / 切换 name / 隐藏 / 卸载时会立即写回 */
  debounceMs?: number;
};

const Impl = lazy(() => import('./RHFDocumentEditor.impl'));

/**
 * 懒加载的 CKEditor 5（DecoupledEditor）：工具栏与编辑区可以分开放置。
 * name 变化时复用同一个实例，只替换内容
 */
export function RHFDocumentEditor<T extends FieldValues>(props: RHFDocumentEditorProps<T>) {
  return (
    <Suspense fallback={<EditorFallback height="100%" />}>
      <Impl {...(props as unknown as RHFDocumentEditorProps<FieldValues>)} />
    </Suspense>
  );
}
