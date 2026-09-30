import { memo } from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';
import { useFormState } from 'react-hook-form';
import { RHFTextField } from '../../../components/form';
import { useContentForm } from '../hooks/useContentForm';

type Props = {
  onDraft: () => void;
  onCancel: () => void;
};

// memo：切换 tab 时父组件重渲染，props（均为 useCallback）不变则跳过
export const Header = memo(function Header({ onDraft, onCancel }: Props) {
  const { control } = useContentForm();
  // 只在这里订阅 isSubmitting，避免整个页面随之重渲染
  const { isSubmitting } = useFormState({ control });

  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={2}
      // 位置由外层布局负责
      sx={{ px: 2, py: 1, bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider' }}
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
});
