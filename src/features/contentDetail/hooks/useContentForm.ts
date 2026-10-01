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
 * フォームのインスタンス + 各項目の活性状態の context（RHF の FormProvider の代わり）。
 *
 * FormProvider はレンダリングのたびに新しい context の値を作るため、提供側が再レンダリングされると（タブ切替など）、
 * useFormContext を使うすべてのコンポーネントも再レンダリングされる（memo でも防げない）。
 * useForm の戻り値は常に同じオブジェクトなので、この context の値は活性状態が変わったときだけ更新される。
 *
 * 注意：form から formState の状態（isDirty、errors など）を読まないこと。再レンダリングが発生しない。
 * 必要な場合は useFormState / useController を使う。
 */
export const ContentDetailContext = createContext<ContentDetailContextValue | null>(null);

export function useContentDetailContext() {
  const ctx = useContext(ContentDetailContext);
  if (!ctx) throw new Error('ContentDetailPage の中で使用してください');
  return ctx;
}

/** フォームのインスタンス */
export const useContentForm = () => useContentDetailContext().form;
