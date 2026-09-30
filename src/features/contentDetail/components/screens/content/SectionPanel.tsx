import { Box, Stack } from '@mui/material';
import { RHFCheckbox, RHFSelect, RHFTextField } from '../../../../../components/form';
import { useContentForm } from '../../../hooks/useContentForm';
import { sectionField } from '../../../utils/fieldPath';
import { CA_RULE_OPTIONS, SECTION_FLAGS } from '../../../utils/options';
import type { Section } from '../../../utils/schema';
import { AiAssistedField } from './AiAssistedField';

type Props = {
  index: number;
};

/**
 * 6 个 section 结构相同，只是字段路径的 index 不同。
 * 正文编辑器（SectionBodyEditor）不在这里，以便切换 section 时复用编辑器实例。
 */
export function SectionPanel({ index }: Props) {
  const { control } = useContentForm();
  const f = <K extends keyof Section>(key: K) => sectionField(index, key);

  return (
    <Stack spacing={2}>
      <AiAssistedField aiName={f('summaryUseAi')} textName={f('summary')} label="概要文" />
      <AiAssistedField aiName={f('keywordsUseAi')} textName={f('keywords')} label="キーワード" />

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 1.5 }}>
        <RHFTextField control={control} name={f('toc')} label="目次" multiline minRows={1} maxRows={6} />
        <RHFTextField control={control} name={f('related')} label="関連" multiline minRows={1} maxRows={6} />
        <RHFTextField control={control} name={f('officialSite')} label="公式サイト" multiline minRows={1} maxRows={6} />
        <RHFTextField control={control} name={f('manualRecommend')} label="手動レコメンド" multiline minRows={1} maxRows={6} />
      </Box>

      <RHFSelect control={control} name={f('caRule')} label="CA変換ルール" options={CA_RULE_OPTIONS} sx={{ width: 180 }} />

      <Stack direction="row" flexWrap="wrap">
        {SECTION_FLAGS.map(({ key, label, help }) => (
          <RHFCheckbox key={key} control={control} name={f(key)} label={label} help={help} />
        ))}
      </Stack>
    </Stack>
  );
}
