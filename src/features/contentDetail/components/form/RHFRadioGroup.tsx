import { FormControlLabel, Radio, RadioGroup } from '@mui/material';
import { useController, type Control, type FieldPath, type FieldValues } from 'react-hook-form';
import { LabelWithHelp } from './LabelWithHelp';
import type { Option } from './types';

type Props<T extends FieldValues> = {
  name: FieldPath<T>;
  control: Control<T>;
  options: readonly Option[];
  disabled?: boolean;
};

export function RHFRadioGroup<T extends FieldValues>({ name, control, options, disabled }: Props<T>) {
  const { field } = useController({ name, control });

  return (
    <RadioGroup
      row
      name={name}
      value={field.value ?? ''}
      onChange={(_, value) => field.onChange(value)}
      onBlur={field.onBlur}
      ref={field.ref}
    >
      {options.map((o) => (
        <FormControlLabel
          key={o.value}
          value={o.value}
          control={<Radio />}
          label={<LabelWithHelp label={o.label} help={o.help} />}
          disabled={disabled}
        />
      ))}
    </RadioGroup>
  );
}
