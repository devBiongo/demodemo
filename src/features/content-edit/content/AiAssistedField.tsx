import { Box, Stack } from '@mui/material';
import { useWatch, type FieldPathByValue } from 'react-hook-form';
import { CharCount, RHFCheckbox, RHFTextField } from '../../../components/form';
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
      <Box sx={{ position: 'relative', flex: 1, minWidth: 0 }}>
        <RHFTextField
          control={control}
          name={textName}
          label={label}
          multiline
          minRows={minRows}
          fullWidth
          disabled={useAi}
          // 底部留出显示文字数量的空间，避免与最后一行文字重叠
          sx={{ '& .MuiInputBase-multiline': { pb: 2.5 } }}
        />
        {/* 文字数量：显示在输入框内的右下角 */}
        <CharCount control={control} name={textName} sx={{ position: 'absolute', right: 12, bottom: 7 }} />
      </Box>
    </Stack>
  );
}
