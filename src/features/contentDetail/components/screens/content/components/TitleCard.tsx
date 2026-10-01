import { Button, Paper, Stack } from '@mui/material';
import { RHFTextField } from '../../../../../../components/form';
import { useContentForm } from '../../../../hooks/useContentForm';
import { useFieldAccess } from '../../../../hooks/useFieldAccess';
import { AiAssistedField } from './AiAssistedField';

type Props = {
  onPreview: () => void;
};

/** タイトル + プレビュー + タイトルキーワード */
export function TitleCard({ onPreview }: Props) {
  const { control } = useContentForm();
  const { isDisabled } = useFieldAccess();

  return (
    <Paper variant="outlined" sx={{ p: 2, flexShrink: 0 }}>
      <Stack spacing={2}>
        <Stack direction="row" spacing={2} alignItems="flex-start">
          <RHFTextField control={control} name="content.title" placeholder="タイトル" fullWidth disabled={isDisabled('content.title')} />
          <Button variant="contained" disabled={isDisabled('action.preview')} sx={{ flexShrink: 0, mt: 0.5 }} onClick={onPreview}>
            プレビュー
          </Button>
        </Stack>
        <AiAssistedField aiName="content.titleKeywordUseAi" textName="content.titleKeyword" label="タイトルキーワード" />
      </Stack>
    </Paper>
  );
}
