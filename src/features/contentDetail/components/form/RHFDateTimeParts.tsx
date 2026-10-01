import { Stack, Typography } from '@mui/material';
import type { Control, FieldPath, FieldPathByValue, FieldValues } from 'react-hook-form';
import { RHFTextField } from './RHFTextField';

export type DateTimeParts = {
  date: string;
  hour: string;
  minute: string;
};

type Props<T extends FieldValues> = {
  name: FieldPathByValue<T, DateTimeParts>;
  control: Control<T>;
  disabled?: boolean;
};

const timeInputProps = { htmlInput: { inputMode: 'numeric', maxLength: 2, style: { textAlign: 'center' } } } as const;

/** 日期 + 时 + 分，三个子字段分别受控，互不影响重渲染 */
export function RHFDateTimeParts<T extends FieldValues>({ name, control, disabled }: Props<T>) {
  const part = (key: keyof DateTimeParts) => `${name}.${key}` as FieldPath<T>;

  return (
    <Stack direction="row" spacing={0.5} alignItems="flex-start">
      <RHFTextField control={control} name={part('date')} type="date" disabled={disabled} sx={{ flex: 1 }} />
      <RHFTextField control={control} name={part('hour')} disabled={disabled} sx={{ width: 52 }} slotProps={timeInputProps} />
      <Typography sx={{ pt: 0.75 }}>:</Typography>
      <RHFTextField control={control} name={part('minute')} disabled={disabled} sx={{ width: 52 }} slotProps={timeInputProps} />
    </Stack>
  );
}
