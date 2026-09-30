import { Typography } from '@mui/material';
import { RHFTextField } from '../../../../../components/form';
import { useContentForm } from '../../../hooks/useContentForm';
import { sectionField } from '../../../utils/fieldPath';

type Props = {
  index: number;
};

/** タブ更新日時：显示在正文编辑器工具栏的左侧 */
export function TabUpdatedAtField({ index }: Props) {
  const { control } = useContentForm();
  return (
    <>
      <Typography variant="body2">タブ更新日時:</Typography>
      <RHFTextField control={control} name={sectionField(index, 'tabUpdatedAt')} type="datetime-local" sx={{ width: 220 }} />
    </>
  );
}
