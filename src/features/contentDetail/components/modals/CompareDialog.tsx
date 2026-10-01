import { useState, type ReactNode } from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, Tab, Tabs, Typography } from '@mui/material';
import { DiffViewer } from '../diff-viewer';
import { useContentForm } from '../../hooks/useContentForm';
import { useFieldAccess } from '../../hooks/useFieldAccess';
import { SECTION_COUNT } from '../../utils/schema';

type Props = {
  /** 最初に表示する section */
  initialIndex: number;
  onClose: () => void;
};

const LABEL_WIDTH = 100;
/** 詳細（差分）の高さ。切り替えても変わらないよう固定 */
const DIFF_HEIGHT = 400;

/**
 * 変更前（読み込み時 / 前回保存時の値 = defaultValues）と 変更後（現在編集中の値）の比較。
 * 開いたときに現在の値のスナップショットを取り、ダイアログを開いている間は編集しても変わらない。
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
            // 画面上の section タブと同じ：番号 + 現在のタブ名（名前がない場合は番号のみ）
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
          {/* スクロールは DiffViewer 自身が担当する（仮想スクロール） */}
          <Box sx={{ gridColumn: 'span 2', p: '0 !important' }}>
            {/* key：タブ切替時に差分を計算し直す */}
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
        // 変更のある項目は薄い黄色で示す
        sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', bgcolor: changed ? '#fff8e1' : undefined }}
      >
        {after}
      </Typography>
    </>
  );
}
