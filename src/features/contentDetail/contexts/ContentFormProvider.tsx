import type { ReactNode } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { mockContent } from '../utils/defaults';
import { contentFormSchema, type ContentFormValues } from '../utils/schema';

/**
 * 只负责创建表单实例并提供 context。
 *
 * 注意：FormProvider 每次渲染都会生成新的 context 值，导致所有 useFormContext 的组件
 * （memo 也挡不住）全部重渲染。所以这里不能持有任何 state，也不能读取 methods.formState
 * （读取即订阅，状态变化时本组件会重渲染）。tab 状态等放在下层组件中。
 */
export function ContentFormProvider({ children }: { children: ReactNode }) {
  const methods = useForm<ContentFormValues>({
    defaultValues: mockContent,
    // 用 schema 统一校验：未挂载的 tab / section 里的字段也会被校验
    resolver: zodResolver(contentFormSchema),
  });

  return <FormProvider {...methods}>{children}</FormProvider>;
}
