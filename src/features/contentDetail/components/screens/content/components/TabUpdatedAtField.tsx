import { Typography } from '@mui/material';
import { RHFTextField } from '../../../form';
import { useContentForm } from '../../../../hooks/useContentForm';
import { useFieldAccess } from '../../../../hooks/useFieldAccess';
import { sectionField } from '../../../../models/schema';

type Props = {
  index: number;
};

/** タブ更新日時：本文エディタのツールバーの左側に表示 */
export function TabUpdatedAtField({ index }: Props) {
  const { control } = useContentForm();
  const { isDisabled } = useFieldAccess();
  const name = sectionField(index, 'tabUpdatedAt');
  return (
    <>
      <Typography variant="body2">タブ更新日時:</Typography>
      <RHFTextField control={control} name={name} type="datetime-local" disabled={isDisabled(name)} sx={{ width: 220 }} />
    </>
  );
}
