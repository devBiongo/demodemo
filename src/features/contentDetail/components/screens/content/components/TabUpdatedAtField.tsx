import { Typography } from '@mui/material';
import { RHFTextField } from '../../../../../../components/form';
import { useContentForm } from '../../../../hooks/useContentForm';
import { useFieldAccess } from '../../../../hooks/useFieldAccess';
import { sectionField } from '../../../../utils/fieldPath';

type Props = {
  index: number;
};

/** タブ更新日時：显示在正文编辑器工具栏的左侧 */
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
