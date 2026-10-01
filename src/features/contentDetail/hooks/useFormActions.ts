import { useCallback } from 'react';
import { useFormState, type SubmitErrorHandler, type SubmitHandler, type UseFormReturn } from 'react-hook-form';
import type { ContentFormValues } from '../models/schema';
import { locateFirstError, type ErrorLocation } from '../models/page';

type Options = {
  /** 検証エラー時に、最初のエラーがあるタブ / section を渡す */
  onInvalidLocated: (location: ErrorLocation) => void;
};

/**
 * フォームの送信 / 下書 / キャンセル の処理。
 * 注意：内部で isDirty を購読しているため、この hook を呼ぶコンポーネントはそれに伴って再レンダリングされる（下層のタブはすべて memo で包んでいるので影響しない）
 */
export function useFormActions(form: UseFormReturn<ContentFormValues>, { onInvalidLocated }: Options) {
  const { control, handleSubmit, getValues, reset } = form;
  const { isDirty } = useFormState({ control });

  const onValid: SubmitHandler<ContentFormValues> = async (values) => {
    // TODO: 保存 API
    console.log('submit', values);
  };

  // 検証エラー時は、エラーのあるタブ / section に自動で切り替える
  const onInvalid: SubmitErrorHandler<ContentFormValues> = (errors) => {
    const location = locateFirstError(errors);
    if (location) onInvalidLocated(location);
  };

  const onDraft = useCallback(() => {
    // 下書き保存はバリデーションなし  TODO: 下書き保存 API
    console.log('draft', getValues());
  }, [getValues]);

  const onCancel = useCallback(() => {
    if (isDirty && !window.confirm('編集内容を破棄しますか？')) return;
    reset();
  }, [isDirty, reset]);

  return { onSubmit: handleSubmit(onValid, onInvalid), onDraft, onCancel };
}
