import type { ReactNode } from 'react';
import { Checkbox, FormControlLabel, type FormControlLabelProps } from '@mui/material';
import { useController, type Control, type FieldPath, type FieldValues } from 'react-hook-form';
import { LabelWithHelp } from './LabelWithHelp';

type Props<T extends FieldValues> = {
  name: FieldPath<T>;
  control: Control<T>;
  label?: ReactNode;
  help?: ReactNode;
  disabled?: boolean;
  labelPlacement?: FormControlLabelProps['labelPlacement'];
};

export function RHFCheckbox<T extends FieldValues>({
  name,
  control,
  label,
  help,
  disabled,
  labelPlacement,
}: Props<T>) {
  const { field } = useController({ name, control });

  const checkbox = (
    <Checkbox
      name={name}
      checked={!!field.value}
      onChange={(_, checked) => field.onChange(checked)}
      onBlur={field.onBlur}
      inputRef={field.ref}
      disabled={disabled}
    />
  );

  if (label == null) return checkbox;

  return (
    <FormControlLabel
      control={checkbox}
      label={<LabelWithHelp label={label} help={help} />}
      labelPlacement={labelPlacement}
      disabled={disabled}
      sx={{ mr: 2 }}
    />
  );
}
