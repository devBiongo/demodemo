import { useCallback } from 'react';
import { useFormState, type SubmitErrorHandler, type SubmitHandler, type UseFormReturn } from 'react-hook-form';
import type { ContentFormValues } from '../utils/schema';
import { locateFirstError, type ErrorLocation } from '../utils/tabs';

type Options = {
  /** 校验失败时，传入第一个错误所在的 tab / section */
  onInvalidLocated: (location: ErrorLocation) => void;
};

/**
 * 表单的提交 / 下書 / キャンセル 处理。
 * 注意：内部订阅了 isDirty，调用本 hook 的组件会随之重渲染（下层的 tab 都用 memo 包裹，不受影响）
 */
export function useFormActions(form: UseFormReturn<ContentFormValues>, { onInvalidLocated }: Options) {
  const { control, handleSubmit, getValues, reset } = form;
  const { isDirty } = useFormState({ control });

  const onValid: SubmitHandler<ContentFormValues> = async (values) => {
    // TODO: 保存 API
    console.log('submit', values);
  };

  // 校验失败时自动切到出错的 tab / section
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
