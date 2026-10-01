import { useState, type ReactNode } from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, Tab, Tabs, Typography } from '@mui/material';
import { DiffViewer } from '../../../../components/diff-viewer';
import { useContentForm } from '../../hooks/useContentForm';
import { useFieldAccess } from '../../hooks/useFieldAccess';
import { SECTION_COUNT } from '../../utils/schema';

type Props = {
  /** 初始显示的 section */
  initialIndex: number;
  onClose: () => void;
};

const LABEL_WIDTH = 100;
/** 詳細（差分）の高さ。切り替えても変わらないよう固定 */
const DIFF_HEIGHT = 400;

/**
 * 変更前（加载 / 上次保存时的值 = defaultValues）与 変更後（当前编辑中的值）的对比。
 * 打开时对当前值做一次快照，弹窗打开期间不随编辑变化。
 */
export function CompareDialog({ initialIndex, onClose }: Props) {
  const { getValues, formState } = useContentForm();
  const { isDisabled } = useFieldAccess();
  const [index, setIndex] = useState(initialIndex);
  const [after] = useState(() => getValues('content'));
  const before = formState.defaultValues?.content;

  const beforeSection = before?.sections?.[index];
  const afterSection = after.sections[index];

  return (
    <Dialog open fullWidth maxWidth="xl" onClose={onClose}>
      <DialogContent>
        <Tabs value={index} onChange={(_, v: number) => setIndex(v)} sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          {Array.from({ length: SECTION_COUNT }, (_, i) => (
            // 与画面上的 section tab 一致：编号 + 当前的 tab 名（没有名字时只显示编号）
            <Tab key={i} value={i} label={`${i + 1} ${after.sections[i].name}`.trim()} />
          ))}
        </Tabs>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: `${LABEL_WIDTH}px minmax(0, 1fr) minmax(0, 1fr)`,
            border: 1,
            borderColor: 'divider',
            '& > *': { borderTop: 1, borderColor: 'divider', p: 1.5, minWidth: 0 },
          }}
        >
          <Box sx={{ borderTop: '0 !important' }} />
          <ColumnHeader>▼ 変更前</ColumnHeader>
          <ColumnHeader>▼ 変更後</ColumnHeader>

          <TextRow label="タイトル" before={before?.title} after={after.title} />
          <TextRow label="タブ名" before={beforeSection?.name} after={afterSection.name} />
          <TextRow label="概要" before={beforeSection?.summary} after={afterSection.summary} />

          <RowLabel>詳細</RowLabel>
          {/* 滚动由 DiffViewer 自身负责（虚拟滚动） */}
          <Box sx={{ gridColumn: 'span 2', p: '0 !important' }}>
            {/* key：切换 tab 时重新计算差异 */}
            <DiffViewer
              key={index}
              oldValue={beforeSection?.body ?? ''}
              newValue={afterSection.body}
              language="html"
              height={DIFF_HEIGHT}
            />
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" disabled={isDisabled('action.compareClose')} onClick={onClose}>
          閉じる
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function ColumnHeader({ children }: { children: ReactNode }) {
  return (
    <Typography variant="body2" color="primary" fontWeight={700} align="center" sx={{ borderTop: '0 !important' }}>
      {children}
    </Typography>
  );
}

function RowLabel({ children }: { children: ReactNode }) {
  return (
    <Typography
      variant="body2"
      color="primary"
      fontWeight={700}
      sx={{ bgcolor: 'action.hover', display: 'flex', alignItems: 'center' }}
    >
      {children}
    </Typography>
  );
}

function TextRow({ label, before = '', after }: { label: string; before?: string; after: string }) {
  const changed = before !== after;
  return (
    <>
      <RowLabel>{label}</RowLabel>
      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
        {before}
      </Typography>
      <Typography
        variant="body2"
        // 有变更的项目用浅黄色标出
        sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', bgcolor: changed ? '#fff8e1' : undefined }}
      >
        {after}
      </Typography>
    </>
  );
}
