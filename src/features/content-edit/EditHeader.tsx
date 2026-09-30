import { Box, Button, Stack, Typography } from '@mui/material';
import { useFormState } from 'react-hook-form';
import { RHFTextField } from '../../components/form';
import { useContentForm } from './form';

type Props = {
  onDraft: () => void;
  onCancel: () => void;
};

export function EditHeader({ onDraft, onCancel }: Props) {
  const { control } = useContentForm();
  // 只在这里订阅 isSubmitting，避免整个页面随之重渲染
  const { isSubmitting } = useFormState({ control });

  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={2}
      sx={{
        px: 2,
        py: 1,
        position: 'sticky',
        top: 0,
        zIndex: (t) => t.zIndex.appBar,
        bgcolor: 'background.paper',
        borderBottom: 1,
        borderColor: 'divider',
      }}
    >
      <Typography color="primary" fontWeight={700}>
        URL
      </Typography>
      <RHFTextField control={control} name="url" disabled sx={{ width: 420 }} />
      <Box sx={{ flex: 1 }} />
      <Button type="submit" variant="contained" disabled={isSubmitting}>
        OK
      </Button>
      <Button variant="contained" onClick={onDraft} disabled={isSubmitting}>
        下書
      </Button>
      <Button variant="contained" onClick={onCancel} disabled={isSubmitting}>
        キャンセル
      </Button>
    </Stack>
  );
}
