import { Checkbox, FormControlLabel, FormGroup, type SxProps, type Theme } from '@mui/material';
import { useController, type Control, type FieldPathByValue, type FieldValues } from 'react-hook-form';
import type { Option } from './types';

type Props<T extends FieldValues> = {
  name: FieldPathByValue<T, string[]>;
  control: Control<T>;
  options: readonly Option[];
  disabled?: boolean;
  sx?: SxProps<Theme>;
};

export function RHFCheckboxGroup<T extends FieldValues>({ name, control, options, disabled, sx }: Props<T>) {
  const { field } = useController({ name, control });
  const selected: string[] = field.value ?? [];

  const toggle = (value: string, checked: boolean) => {
    const next = new Set(selected);
    if (checked) next.add(value);
    else next.delete(value);
    // 選択肢の定義と同じ順序を保つ
    field.onChange(options.filter((o) => next.has(o.value)).map((o) => o.value));
  };

  return (
    <FormGroup sx={sx} onBlur={field.onBlur}>
      {options.map((o) => (
        <FormControlLabel
          key={o.value}
          label={o.label}
          disabled={disabled}
          control={
            <Checkbox checked={selected.includes(o.value)} onChange={(_, c) => toggle(o.value, c)} />
          }
        />
      ))}
    </FormGroup>
  );
}
