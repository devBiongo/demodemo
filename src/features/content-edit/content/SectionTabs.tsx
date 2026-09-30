import { memo } from 'react';
import { Box, InputBase, Stack, Tooltip } from '@mui/material';
import { useController } from 'react-hook-form';
import { sectionField, useContentForm } from '../form';
import { SECTION_COUNT } from '../schema';

type Props = {
  value: number;
  onChange: (index: number) => void;
};

export function SectionTabs({ value, onChange }: Props) {
  return (
    <Stack
      direction="row"
      role="tablist"
      // 灰色底，上面排列白色的 tab
      sx={{ bgcolor: 'grey.100', px: 1.5, py: 0.75, gap: 0.75, overflowX: 'auto', borderBottom: 1, borderColor: 'divider' }}
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

/** tab 名可直接编辑；只订阅自己的 name 字段 */
const SectionTab = memo(function SectionTab({ index, active, onSelect }: TabProps) {
  const { control } = useContentForm();
  const {
    field,
    fieldState: { error },
  } = useController({ control, name: sectionField(index, 'name') });

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
        gap: 0.75,
        width: 150,
        height: 34,
        flexShrink: 0,
        px: 1,
        cursor: 'pointer',
        // 白色卡片；选中（或出错）时整圈边框变为主色（错误色）。
        // 用 border + 内侧 1px 阴影呈现 2px 的效果，尺寸不变，切换时不会跳动
        bgcolor: 'background.paper',
        borderRadius: 1,
        border: 1,
        borderColor: highlighted ? accent : 'divider',
        boxShadow: (t) => (highlighted ? `inset 0 0 0 1px ${error ? t.palette.error.main : t.palette.primary.main}` : 'none'),
        transition: (t) => t.transitions.create(['box-shadow', 'border-color'], { duration: t.transitions.duration.shortest }),
        '&:hover': { borderColor: highlighted ? accent : 'grey.400' },
      }}
    >
      <Box
        sx={{
          width: 20,
          height: 20,
          flexShrink: 0,
          display: 'grid',
          placeItems: 'center',
          borderRadius: 1,
          fontSize: 11,
          fontWeight: 600,
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
          onFocus={() => onSelect(index)}
          placeholder="タブ名"
          sx={{
            flex: 1,
            minWidth: 0,
            fontSize: 13,
            fontWeight: active ? 500 : 400,
            color: error ? 'error.main' : active ? 'primary.main' : 'text.primary',
            '& .MuiInputBase-input': { px: 0.75, py: 0.5 },
            '& .MuiInputBase-input::placeholder': { color: 'text.disabled', opacity: 1 },
          }}
        />
      </Tooltip>
    </Box>
  );
});
