import { useState } from 'react';
import { Box, Tab, Tabs, Typography } from '@mui/material';
import { FormProvider, useForm, type SubmitErrorHandler, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AttributeTab } from './attributes/AttributeTab';
import { ContentTab } from './content/ContentTab';
import { mockContent } from './defaults';
import { EditHeader } from './EditHeader';
import { locateFirstError, type MainTab } from './form';
import { contentFormSchema, type ContentFormValues } from './schema';

const TABS: { value: MainTab; label: string }[] = [
  { value: 'content', label: 'コンテンツ' },
  { value: 'attributes', label: '属性' },
  { value: 'category', label: 'カテゴリー' },
  { value: 'history', label: '更新履歴' },
];

export function ContentEditPage() {
  const methods = useForm<ContentFormValues>({
    defaultValues: mockContent,
    // 用 schema 统一校验：未挂载的 tab / section 里的字段也会被校验
    resolver: zodResolver(contentFormSchema),
  });

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

  const onDraft = () => {
    // 下書き保存はバリデーションなし  TODO: 下書き保存 API
    console.log('draft', methods.getValues());
  };

  const onCancel = () => {
    if (methods.formState.isDirty && !window.confirm('編集内容を破棄しますか？')) return;
    methods.reset();
  };

  return (
    <FormProvider {...methods}>
      <Box component="form" noValidate onSubmit={methods.handleSubmit(onValid, onInvalid)} sx={{ minHeight: '100vh' }}>
        <EditHeader onDraft={onDraft} onCancel={onCancel} />

        <Tabs value={tab} onChange={(_, v: MainTab) => setTab(v)} sx={{ px: 2, borderBottom: 1, borderColor: 'divider' }}>
          {TABS.map((t) => (
            <Tab key={t.value} value={t.value} label={t.label} />
          ))}
        </Tabs>

        {/* 只渲染当前 tab；值保存在 form state 中，切换不会丢失 */}
        <Box sx={{ p: 2 }}>
          {tab === 'content' && <ContentTab sectionIndex={sectionIndex} onSectionChange={setSectionIndex} />}
          {tab === 'attributes' && <AttributeTab />}
          {(tab === 'category' || tab === 'history') && <Typography color="text.secondary">未実装</Typography>}
        </Box>
      </Box>
    </FormProvider>
  );
}
