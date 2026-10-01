import { memo } from 'react';
import { Box, InputBase, lighten, Stack, Tooltip } from '@mui/material';
import { useController } from 'react-hook-form';
import { useContentForm } from '../../../../hooks/useContentForm';
import { useFieldAccess } from '../../../../hooks/useFieldAccess';
import { sectionField } from '../../../../utils/fieldPath';
import { SECTION_COUNT } from '../../../../utils/schema';

type Props = {
  value: number;
  onChange: (index: number) => void;
};

export function SectionTabs({ value, onChange }: Props) {
  return (
    <Stack
      direction="row"
      role="tablist"
      // 自身の背景と枠線は持たず、白いタブをページの灰色の背景の上に直接並べる。
      // overflowX: auto ははみ出した部分を切り取る（縦方向も）ため、選択枠の外側 1px の影の上下が欠ける。
      // そのため四辺に 2px の内側の余白を取り、-2px の外側の余白で打ち消す（位置は変わらない）
      // flexShrink: 0：縦方向の flex レイアウトで高さが縮まないようにする
      sx={{ gap: 0.75, overflowX: 'auto', p: '2px', m: '-2px', flexShrink: 0 }}
    >
      {Array.from({ length: SECTION_COUNT }, (_, i) => (
        <SectionTab key={i} index={i} active={i === value} onSelect={onChange} />
      ))}
    </Stack>
  );
}

type TabProps = {
  index: number;
  active: boolean;
  onSelect: (index: number) => void;
};

/** タブ名は直接編集できる。自分の name 項目だけを購読する */
const SectionTab = memo(function SectionTab({ index, active, onSelect }: TabProps) {
  const { control } = useContentForm();
  const name = sectionField(index, 'name');
  const {
    field,
    fieldState: { error },
  } = useController({ control, name });
  const disabled = useFieldAccess().isDisabled(name);

  const highlighted = active || !!error;
  const accent = error ? 'error.main' : 'primary.main';

  return (
    <Box
      role="tab"
      aria-selected={active}
      onClick={() => onSelect(index)}
      sx={{
        display: 'flex',
        alignItems: 'center',
        // 丸から右の入力欄までの距離を、上 / 下 / 左の枠線までの距離と揃える（4px）
        gap: 0.5,
        width: 150,
        height: 34,
        flexShrink: 0,
        // 左の内側の余白 = (内側の高さ 32 - 丸 24) / 2 = 4px。丸から上の枠線までの距離と揃える
        pl: 0.5,
        pr: 1,
        cursor: 'pointer',
        // 白いカード。選択時（またはエラー時）は枠線全体をメインカラー（エラー色）にする。
        // border + 外側 1px の影で 2px に見せる：サイズは変わらず、内側の間隔も詰まらない
        // 選択時（またはエラー時）はごく薄いメインカラー（エラー色）を敷く。
        // lighten で白を混ぜた不透明な色を使い、半透明の色が灰色のページ背景に重なってくすむのを防ぐ。
        // 非活性時は灰色の背景（テーマの非活性の入力欄と同じ色）。選択状態は引き続き枠線と丸で示す
        bgcolor: (t) =>
          disabled
            ? t.palette.grey[100]
            : highlighted
              ? lighten(error ? t.palette.error.main : t.palette.primary.main, 0.94)
              : t.palette.background.paper,
        borderRadius: 1,
        border: 1,
        borderColor: highlighted ? accent : 'divider',
        boxShadow: (t) => (highlighted ? `0 0 0 1px ${error ? t.palette.error.main : t.palette.primary.main}` : 'none'),
        transition: (t) =>
          t.transitions.create(['box-shadow', 'border-color', 'background-color'], { duration: t.transitions.duration.shortest }),
        '&:hover': { borderColor: highlighted ? accent : 'grey.400' },
      }}
    >
      <Box
        sx={{
          // 丸い番号
          width: 24,
          height: 24,
          flexShrink: 0,
          display: 'grid',
          placeItems: 'center',
          borderRadius: '50%',
          fontSize: 12,
          fontWeight: 700,
          lineHeight: 1,
          color: highlighted ? '#fff' : 'text.secondary',
          bgcolor: highlighted ? accent : 'transparent',
          transition: (t) => t.transitions.create(['background-color', 'color'], { duration: t.transitions.duration.shortest }),
        }}
      >
        {index + 1}
      </Box>
      <Tooltip title={error?.message ?? ''} disableHoverListener={!error}>
        <InputBase
          {...field}
          inputRef={field.ref}
          disabled={disabled}
          onFocus={() => onSelect(index)}
          sx={{
            flex: 1,
            minWidth: 0,
            // 文字は選択状態によって変えない（エラー時だけ赤くする）。非活性時の灰色の文字は MUI が処理する
            fontSize: 14,
            color: error ? 'error.main' : 'text.primary',
            '& .MuiInputBase-input': { px: 0.75, py: 0.5 },
            // 非活性時はクリックをタブ本体に通し、section の切替はできるようにする
            pointerEvents: disabled ? 'none' : undefined,
            // テーマの非活性の入力欄の灰色の背景は使わない（タブ自体に背景がある）
            '&.Mui-disabled': { bgcolor: 'transparent' },
          }}
        />
      </Tooltip>
    </Box>
  );
});
