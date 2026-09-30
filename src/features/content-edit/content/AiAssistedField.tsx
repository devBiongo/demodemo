import { Box, Stack } from '@mui/material';
import { useWatch, type FieldPathByValue } from 'react-hook-form';
import { RHFCheckbox, RHFTextField } from '../../../components/form';
import { useContentForm } from '../form';
import type { ContentFormValues } from '../schema';

type Props = {
  aiName: FieldPathByValue<ContentFormValues, boolean>;
  textName: FieldPathByValue<ContentFormValues, string>;
  label: string;
  minRows?: number;
};

/** 「ChatGPTを使用」チェック時は内容を自動生成するため入力不可にする */
export function AiAssistedField({ aiName, textName, label, minRows = 2 }: Props) {
  const { control } = useContentForm();
  // 只订阅自己的 checkbox，勾选变化时只有本组件重渲染
  const useAi = useWatch({ control, name: aiName });

  return (
    <Stack direction="row" spacing={2} alignItems="flex-start">
      <Box sx={{ width: 150, flexShrink: 0, pt: 0.5 }}>
        <RHFCheckbox control={control} name={aiName} label="ChatGPTを使用" />
      </Box>
      <RHFTextField control={control} name={textName} label={label} multiline minRows={minRows} fullWidth disabled={useAi} />
    </Stack>
  );
}
