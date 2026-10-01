import { memo } from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';
import { useFormState } from 'react-hook-form';
import { RHFTextField } from './form';
import { useContentForm } from '../hooks/useContentForm';
import { useFieldAccess } from '../hooks/useFieldAccess';

type Props = {
  onDraft: () => void;
  onCancel: () => void;
};

// memo：タブ切替で親が再レンダリングされても、props（すべて useCallback）が変わらなければスキップ
export const Header = memo(function Header({ onDraft, onCancel }: Props) {
  const { control } = useContentForm();
  // isSubmitting はここでだけ購読し、ページ全体が再レンダリングされるのを避ける
  const { isSubmitting } = useFormState({ control });
  const { isDisabled } = useFieldAccess();

  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={2}
      // 位置は外側のレイアウトが決める
      sx={{ px: 2, py: 1, bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider' }}
    >
      <Typography color="primary" fontWeight={700}>
        URL
      </Typography>
      <RHFTextField control={control} name="url" disabled={isDisabled('url')} sx={{ width: 420 }} />
      <Box sx={{ flex: 1 }} />
      <Button type="submit" variant="contained" disabled={isSubmitting || isDisabled('action.submit')}>
        OK
      </Button>
      <Button variant="contained" onClick={onDraft} disabled={isSubmitting || isDisabled('action.draft')}>
        下書
      </Button>
      <Button variant="contained" onClick={onCancel} disabled={isSubmitting || isDisabled('action.cancel')}>
        キャンセル
      </Button>
    </Stack>
  );
});
