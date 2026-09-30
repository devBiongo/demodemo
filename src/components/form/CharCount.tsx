import { Typography, type SxProps, type Theme } from '@mui/material';
import { useWatch, type Control, type FieldPathByValue, type FieldValues } from 'react-hook-form';

type Props<T extends FieldValues> = {
  name: FieldPathByValue<T, string>;
  control: Control<T>;
  sx?: SxProps<Theme>;
};

/**
 * 显示字段的文字数量；没有值时不显示。
 * 单独订阅该字段，输入时只有本组件重渲染。
 */
export function CharCount<T extends FieldValues>({ name, control, sx }: Props<T>) {
  const value: string = useWatch({ control, name }) ?? '';
  // 按 Unicode 字符计数（emoji 等代理对算 1 个字）
  const count = [...value].length;
  if (count === 0) return null;

  return (
    <Typography
      component="span"
      aria-live="polite"
      sx={{ fontSize: 11, lineHeight: 1, color: 'text.secondary', pointerEvents: 'none', userSelect: 'none', ...sx }}
    >
      {count}文字
    </Typography>
  );
}
