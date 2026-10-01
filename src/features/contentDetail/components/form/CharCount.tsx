import { Typography, type SxProps, type Theme } from '@mui/material';
import { useWatch, type Control, type FieldPathByValue, type FieldValues } from 'react-hook-form';

type Props<T extends FieldValues> = {
  name: FieldPathByValue<T, string>;
  control: Control<T>;
  sx?: SxProps<Theme>;
};

/**
 * 項目の文字数を表示する。値がない場合は表示しない。
 * この項目だけを購読するので、入力中に再レンダリングされるのはこのコンポーネントだけ。
 */
export function CharCount<T extends FieldValues>({ name, control, sx }: Props<T>) {
  const value: string = useWatch({ control, name }) ?? '';
  // Unicode の文字単位で数える（絵文字などのサロゲートペアも 1 文字）
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
