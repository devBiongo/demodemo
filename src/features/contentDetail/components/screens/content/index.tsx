import { memo, useDeferredValue, useState } from 'react';
import { Paper, Stack } from '@mui/material';
import { PreviewDialog } from '../../modals/PreviewDialog';
import { SectionBodyEditor } from './components/SectionBodyEditor';
import { SectionPanel } from './components/SectionPanel';
import { SectionTabs } from './components/SectionTabs';
import { TabUpdatedAtField } from './components/TabUpdatedAtField';
import { TitleCard } from './components/TitleCard';

type Props = {
  sectionIndex: number;
  onSectionChange: (index: number) => void;
};

// memo：非表示の間に親（タブ切替など）が再レンダリングされてもスキップ
export const ContentScreen = memo(function ContentScreen({ sectionIndex, onSectionChange }: Props) {
  const [previewOpen, setPreviewOpen] = useState(false);
  // タブの選択状態はすぐに更新する。下の内容は遅延させた値を使い、タブが選択表示になった後にレンダリングする
  const contentIndex = useDeferredValue(sectionIndex);

  return (
    // タイトルカード と section タブの間は 8px。親コンテナの高さを埋め、内容カードは内部でスクロール
    <Stack spacing={1} sx={{ flex: 1, minHeight: 0 }}>
      <TitleCard onPreview={() => setPreviewOpen(true)} />

      {/* タブはページの背景に直接置き、下のカードは内容エリアだけを含む。タブとカードの間は 4px。
          useFlexGap：margin ではなく gap で間隔を取る。そうしないと Stack が子要素の margin を 0 にリセットし、
          SectionTabs が内側の余白を打ち消すための -2px の margin が効かなくなる */}
      <Stack spacing={0.5} useFlexGap sx={{ flex: 1, minHeight: 0 }}>
        <SectionTabs value={sectionIndex} onChange={onSectionChange} />
        {/* 残りの高さを埋める（下端はビューポートに近づける）。収まらない場合はカード内でスクロール */}
        <Paper variant="outlined" sx={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
          <SectionContent index={contentIndex} />
        </Paper>
      </Stack>

      {previewOpen && <PreviewDialog sectionIndex={contentIndex} onClose={() => setPreviewOpen(false)} />}
    </Stack>
  );
});

/** section の内容エリア。memo：タブだけを先に切り替えるレンダリング（index は未変更）ではスキップ */
const SectionContent = memo(function SectionContent({ index }: { index: number }) {
  return (
    // useFlexGap：gap で間隔を取る。そうしないと Stack が子要素に付ける margin-top により、
    // 全画面編集（position: fixed; inset: 0）のエディタの上に 16px の隙間ができる
    <Stack spacing={2} useFlexGap sx={{ p: 2 }} role="tabpanel">
      {/* 通常の項目：key が変わると再マウントし、各 section が互いに干渉しない */}
      <SectionPanel key={index} index={index} />
      {/* エディタ：key を付けず、section を切り替えても同じインスタンスを使う */}
      <SectionBodyEditor index={index} toolbarStart={<TabUpdatedAtField key={index} index={index} />} />
    </Stack>
  );
});
