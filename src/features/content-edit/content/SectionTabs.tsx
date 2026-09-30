import { memo } from 'react';
import { Box, InputBase, lighten, Stack, Tooltip } from '@mui/material';
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
      // 没有自己的背景和边框，白色的 tab 直接排列在页面的灰色背景上。
      // overflowX: auto 会把超出部分裁掉（纵向也会），选中框向外 1px 的阴影会缺上下两边；
      // 所以四周留 2px 内边距，再用 -2px 外边距抵消，位置不变
      // flexShrink: 0：在纵向 flex 布局中高度不被压缩
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
        // 圆圈到右侧输入框的距离，与到上 / 下 / 左边框的距离一致（4px）
        gap: 0.5,
        width: 150,
        height: 34,
        flexShrink: 0,
        // 左内边距 = (内高 32 - 圆圈 24) / 2 = 4px，与圆圈到上边框的距离一致
        pl: 0.5,
        pr: 1,
        cursor: 'pointer',
        // 白色卡片；选中（或出错）时整圈边框变为主色（错误色）。
        // 用 border + 外侧 1px 阴影呈现 2px 的效果：尺寸不变，内部间距也不会被压缩
        // 选中（或出错）时铺一层很淡的主色（错误色）。
        // 用 lighten 混入白色得到不透明的颜色，避免半透明色叠在灰色页面背景上发灰
        bgcolor: (t) =>
          highlighted ? lighten(error ? t.palette.error.main : t.palette.primary.main, 0.94) : t.palette.background.paper,
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
          // 圆形编号
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
          onFocus={() => onSelect(index)}
          sx={{
            flex: 1,
            minWidth: 0,
            // 文字不随选中状态变化（只有出错时变红）
            fontSize: 14,
            color: error ? 'error.main' : 'text.primary',
            '& .MuiInputBase-input': { px: 0.75, py: 0.5 },
          }}
        />
      </Tooltip>
    </Box>
  );
});
