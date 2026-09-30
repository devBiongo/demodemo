import { memo, useCallback } from 'react';
import { Box, IconButton, InputBase, Stack, Tooltip } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useController } from 'react-hook-form';
import { createEmptySection } from '../defaults';
import { sectionField, useContentForm } from '../form';
import { SECTION_COUNT } from '../schema';

type Props = {
  value: number;
  onChange: (index: number) => void;
};

export function SectionTabs({ value, onChange }: Props) {
  const { setValue } = useContentForm();

  const clearSection = useCallback(
    (index: number) => {
      if (!window.confirm(`タブ${index + 1}の内容をクリアしますか？`)) return;
      setValue(`content.sections.${index}`, createEmptySection(), { shouldDirty: true });
    },
    [setValue],
  );

  return (
    <Stack direction="row" role="tablist" sx={{ bgcolor: 'grey.200', px: 1, py: 0.75, gap: 1, overflowX: 'auto' }}>
      {Array.from({ length: SECTION_COUNT }, (_, i) => (
        <SectionTab key={i} index={i} active={i === value} onSelect={onChange} onClear={clearSection} />
      ))}
    </Stack>
  );
}

type TabProps = {
  index: number;
  active: boolean;
  onSelect: (index: number) => void;
  onClear: (index: number) => void;
};

/** tab 名可直接编辑；只订阅自己的 name 字段 */
const SectionTab = memo(function SectionTab({ index, active, onSelect, onClear }: TabProps) {
  const { control } = useContentForm();
  const {
    field,
    fieldState: { error },
  } = useController({ control, name: sectionField(index, 'name') });

  return (
    <Box
      role="tab"
      aria-selected={active}
      onClick={() => onSelect(index)}
      sx={{
        display: 'flex',
        alignItems: 'center',
        width: 140,
        flexShrink: 0,
        cursor: 'pointer',
        borderBottom: 2,
        borderColor: error ? 'error.main' : active ? 'primary.main' : 'transparent',
      }}
    >
      <Box
        sx={{
          width: 20,
          height: 20,
          flexShrink: 0,
          display: 'grid',
          placeItems: 'center',
          fontSize: 12,
          color: '#fff',
          bgcolor: active ? 'primary.main' : 'grey.500',
        }}
      >
        {index + 1}
      </Box>
      <Tooltip title={error?.message ?? ''} disableHoverListener={!error}>
        <InputBase
          {...field}
          inputRef={field.ref}
          onFocus={() => onSelect(index)}
          sx={{ flex: 1, mx: 1, fontSize: 13, color: active ? 'primary.main' : 'text.primary' }}
        />
      </Tooltip>
      <IconButton
        size="small"
        aria-label={`タブ${index + 1}をクリア`}
        onClick={(e) => {
          e.stopPropagation();
          onClear(index);
        }}
      >
        <CloseIcon sx={{ fontSize: 14 }} />
      </IconButton>
    </Box>
  );
});
