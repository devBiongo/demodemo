import { useCallback, useState } from 'react';
import { Box, Tab, Tabs, Typography } from '@mui/material';
import { FormProvider, useForm, useFormState, type SubmitErrorHandler, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { KeepAliveTabPanel } from '../../components/KeepAliveTabPanel';
import { AttributeTab } from './attributes/AttributeTab';
import { ContentTab } from './content/ContentTab';
import { mockContent } from './defaults';
import { EditHeader } from './EditHeader';
import { locateFirstError, useContentForm, type MainTab } from './form';
import { contentFormSchema, type ContentFormValues } from './schema';

const TABS: { value: MainTab; label: string }[] = [
  { value: 'content', label: 'コンテンツ' },
  { value: 'attributes', label: '属性' },
  { value: 'category', label: 'カテゴリー' },
  { value: 'history', label: '更新履歴' },
];

/**
 * 只负责创建表单实例并提供 context。
 *
 * 注意：FormProvider 每次渲染都会生成新的 context 值，导致所有 useFormContext 的组件
 * （memo 也挡不住）全部重渲染。所以这里不能持有任何 state，也不能读取 methods.formState
 * （读取即订阅，状态变化时本组件会重渲染）。tab 状态等放在下层的 ContentEditForm 中。
 */
export function ContentEditPage() {
  const methods = useForm<ContentFormValues>({
    defaultValues: mockContent,
    // 用 schema 统一校验：未挂载的 tab / section 里的字段也会被校验
    resolver: zodResolver(contentFormSchema),
  });

  return (
    <FormProvider {...methods}>
      <ContentEditForm />
    </FormProvider>
  );
}

function ContentEditForm() {
  const { control, handleSubmit, getValues, reset } = useContentForm();
  // 只有本组件订阅 isDirty；下层的 tab 都用 memo 包裹，不受影响
  const { isDirty } = useFormState({ control });

  const [tab, setTab] = useState<MainTab>('content');
  const [sectionIndex, setSectionIndex] = useState(0);

  const onValid: SubmitHandler<ContentFormValues> = async (values) => {
    // TODO: 保存 API
    console.log('submit', values);
  };

  // 校验失败时自动切到出错的 tab / section
  const onInvalid: SubmitErrorHandler<ContentFormValues> = (errors) => {
    const location = locateFirstError(errors);
    if (!location) return;
    setTab(location.tab);
    if (location.section !== undefined) setSectionIndex(location.section);
  };

  const onDraft = useCallback(() => {
    // 下書き保存はバリデーションなし  TODO: 下書き保存 API
    console.log('draft', getValues());
  }, [getValues]);

  const onCancel = useCallback(() => {
    if (isDirty && !window.confirm('編集内容を破棄しますか？')) return;
    reset();
  }, [isDirty, reset]);

  return (
    <Box component="form" noValidate onSubmit={handleSubmit(onValid, onInvalid)} sx={{ minHeight: '100vh' }}>
      <EditHeader onDraft={onDraft} onCancel={onCancel} />

      <Tabs value={tab} onChange={(_, v: MainTab) => setTab(v)} sx={{ px: 2, borderBottom: 1, borderColor: 'divider' }}>
        {TABS.map((t) => (
          <Tab key={t.value} value={t.value} label={t.label} />
        ))}
      </Tabs>

      {/* 首次显示时挂载，之后只隐藏不卸载：再次切换时无需重建（尤其是编辑器） */}
      <Box sx={{ p: 2 }}>
        <KeepAliveTabPanel active={tab === 'content'}>
          <ContentTab sectionIndex={sectionIndex} onSectionChange={setSectionIndex} />
        </KeepAliveTabPanel>
        <KeepAliveTabPanel active={tab === 'attributes'}>
          <AttributeTab />
        </KeepAliveTabPanel>
        {(tab === 'category' || tab === 'history') && <Typography color="text.secondary">未実装</Typography>}
      </Box>
    </Box>
  );
}
