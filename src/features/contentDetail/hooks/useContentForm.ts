import { createContext, useContext } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import type { IsDisabled } from '../utils/fieldControl';
import type { ContentFormValues } from '../utils/schema';

type ContentDetailContextValue = {
  form: UseFormReturn<ContentFormValues>;
  /** 各項目の活性状態（index.tsx の controlFields による） */
  isDisabled: IsDisabled;
};

/**
 * 表单实例 + 各项目活性状态的 context（代替 RHF 的 FormProvider）。
 *
 * FormProvider 每次渲染都会生成新的 context 值，提供方一重渲染（切换 tab 等），
 * 所有 useFormContext 的组件都会跟着重渲染（memo 也挡不住）。
 * useForm 的返回值始终是同一个对象，所以本 context 的值只在活性状态变化时才更新。
 *
 * 注意：不要从 form 读取 formState 的状态（isDirty、errors 等），不会触发重渲染。
 * 需要时用 useFormState / useController。
 */
export const ContentDetailContext = createContext<ContentDetailContextValue | null>(null);

export function useContentDetailContext() {
  const ctx = useContext(ContentDetailContext);
  if (!ctx) throw new Error('ContentDetailPage の中で使用してください');
  return ctx;
}

/** 表单实例 */
export const useContentForm = () => useContentDetailContext().form;
