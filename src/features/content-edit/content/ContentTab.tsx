import { useState } from 'react';
import { Button, Dialog, DialogContent, DialogTitle, Paper, Stack } from '@mui/material';
import { RHFTextField } from '../../../components/form';
import { HtmlPreview } from '../../../components/HtmlPreview';
import { sectionField, useContentForm } from '../form';
import { AiAssistedField } from './AiAssistedField';
import { SectionBodyEditor } from './SectionBodyEditor';
import { SectionPanel, TabUpdatedAtField } from './SectionPanel';
import { SectionTabs } from './SectionTabs';

type Props = {
  sectionIndex: number;
  onSectionChange: (index: number) => void;
};

export function ContentTab({ sectionIndex, onSectionChange }: Props) {
  const { control } = useContentForm();
  const [previewOpen, setPreviewOpen] = useState(false);

  return (
    <Stack spacing={2}>
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Stack spacing={2}>
          <Stack direction="row" spacing={2} alignItems="flex-start">
            <RHFTextField control={control} name="content.title" placeholder="タイトル" fullWidth />
            <Button variant="contained" sx={{ flexShrink: 0, mt: 0.5 }} onClick={() => setPreviewOpen(true)}>
              プレビュー
            </Button>
          </Stack>
          <AiAssistedField aiName="content.titleKeywordUseAi" textName="content.titleKeyword" label="タイトルキーワード" />
        </Stack>
      </Paper>

      <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
        <SectionTabs value={sectionIndex} onChange={onSectionChange} />
        <Stack spacing={2} sx={{ p: 2 }} role="tabpanel">
          {/* 普通字段：key 切换时重新挂载，各 section 互不干扰 */}
          <SectionPanel key={sectionIndex} index={sectionIndex} />
          {/* 编辑器：不加 key，切换 section 时复用同一实例 */}
          <SectionBodyEditor
            index={sectionIndex}
            toolbarStart={<TabUpdatedAtField key={sectionIndex} index={sectionIndex} />}
          />
        </Stack>
      </Paper>

      {previewOpen && <PreviewDialog sectionIndex={sectionIndex} onClose={() => setPreviewOpen(false)} />}
    </Stack>
  );
}

function PreviewDialog({ sectionIndex, onClose }: { sectionIndex: number; onClose: () => void }) {
  const { getValues } = useContentForm();
  const [title, body] = getValues(['content.title', sectionField(sectionIndex, 'body')]);

  return (
    <Dialog open fullWidth maxWidth="lg" onClose={onClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent dividers>
        <HtmlPreview html={body} height="70vh" />
      </DialogContent>
    </Dialog>
  );
}
