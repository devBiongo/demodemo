import { MenuItem } from '@mui/material';
import type { FieldValues } from 'react-hook-form';
import { RHFTextField, type RHFTextFieldProps } from './RHFTextField';
import type { Option } from './types';

type Props<T extends FieldValues> = Omit<RHFTextFieldProps<T>, 'select' | 'children'> & {
  options: readonly Option[];
};

export function RHFSelect<T extends FieldValues>({ options, ...props }: Props<T>) {
  return (
    <RHFTextField {...props} select>
      {options.map((o) => (
        <MenuItem key={o.value} value={o.value}>
          {o.label}
        </MenuItem>
      ))}
    </RHFTextField>
  );
}
