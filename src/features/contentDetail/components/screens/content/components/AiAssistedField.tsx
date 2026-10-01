import { Box, Stack } from '@mui/material';
import type { FieldPathByValue } from 'react-hook-form';
import { CharCount, RHFCheckbox, RHFTextField } from '../../../form';
import { useContentForm } from '../../../../hooks/useContentForm';
import { useFieldAccess } from '../../../../hooks/useFieldAccess';
import type { ContentFormValues } from '../../../../models/schema';

type Props = {
  aiName: FieldPathByValue<ContentFormValues, boolean>;
  textName: FieldPathByValue<ContentFormValues, string>;
  label: string;
  minRows?: number;
};

/** 「ChatGPTを使用」+ テキスト。チェック時の入力不可はルール（fieldRules.ts）で制御 */
export function AiAssistedField({ aiName, textName, label, minRows = 2 }: Props) {
  const { control } = useContentForm();
  const { isDisabled } = useFieldAccess();

  return (
    <Stack direction="row" spacing={2} alignItems="flex-start">
      <Box sx={{ width: 150, flexShrink: 0, pt: 0.5 }}>
        <RHFCheckbox control={control} name={aiName} label="ChatGPTを使用" disabled={isDisabled(aiName)} />
      </Box>
      <Box sx={{ position: 'relative', flex: 1, minWidth: 0 }}>
        <RHFTextField
          control={control}
          name={textName}
          label={label}
          multiline
          minRows={minRows}
          fullWidth
          disabled={isDisabled(textName)}
          // 下に文字数を表示する余白を取り、最後の行の文字と重ならないようにする
          sx={{ '& .MuiInputBase-multiline': { pb: 2.5 } }}
        />
        {/* 文字数：入力欄の内側の右下に表示 */}
        <CharCount control={control} name={textName} sx={{ position: 'absolute', right: 12, bottom: 7 }} />
      </Box>
    </Stack>
  );
}
