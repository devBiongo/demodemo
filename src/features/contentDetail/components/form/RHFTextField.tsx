import { TextField, type TextFieldProps } from '@mui/material';
import { useController, type Control, type FieldPath, type FieldValues } from 'react-hook-form';

export type RHFTextFieldProps<T extends FieldValues> = Omit<
  TextFieldProps,
  'name' | 'value' | 'defaultValue' | 'onChange' | 'onBlur' | 'inputRef' | 'error'
> & {
  name: FieldPath<T>;
  control: Control<T>;
};

export function RHFTextField<T extends FieldValues>({
  name,
  control,
  helperText,
  ...props
}: RHFTextFieldProps<T>) {
  const {
    field: { ref, value, onChange, onBlur },
    fieldState: { error },
  } = useController({ name, control });

  return (
    <TextField
      {...props}
      name={name}
      value={value ?? ''}
      onChange={onChange}
      onBlur={onBlur}
      inputRef={ref}
      error={!!error}
      helperText={error?.message ?? helperText}
    />
  );
}
