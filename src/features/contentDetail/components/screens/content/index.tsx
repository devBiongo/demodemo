import { memo, useState } from 'react';
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

// memo：隐藏期间父组件（切换 tab 等）重渲染时跳过
export const ContentScreen = memo(function ContentScreen({ sectionIndex, onSectionChange }: Props) {
  const [previewOpen, setPreviewOpen] = useState(false);

  return (
    // 标题卡片 与 section tab 之间 8px。占满父容器高度，内容卡片在内部滚动
    <Stack spacing={1} sx={{ flex: 1, minHeight: 0 }}>
      <TitleCard onPreview={() => setPreviewOpen(true)} />

      {/* tab 直接放在页面背景上，下方的卡片只包含内容区；tab 与卡片之间 4px。
          useFlexGap：用 gap 而不是 margin 实现间距，否则 Stack 会把子元素的 margin 重置为 0，
          SectionTabs 用来抵消内边距的 -2px margin 就会失效 */}
      <Stack spacing={0.5} useFlexGap sx={{ flex: 1, minHeight: 0 }}>
        <SectionTabs value={sectionIndex} onChange={onSectionChange} />
        {/* 占满剩余高度（底部贴近视口）；放不下时在卡片内部滚动 */}
        <Paper variant="outlined" sx={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
          {/* useFlexGap：用 gap 实现间距。否则 Stack 给子元素加的 margin-top 会让
              全屏编辑（position: fixed; inset: 0）的编辑器顶部空出 16px */}
          <Stack spacing={2} useFlexGap sx={{ p: 2 }} role="tabpanel">
            {/* 普通字段：key 切换时重新挂载，各 section 互不干扰 */}
            <SectionPanel key={sectionIndex} index={sectionIndex} />
            {/* 编辑器：不加 key，切换 section 时复用同一实例 */}
            <SectionBodyEditor
              index={sectionIndex}
              toolbarStart={<TabUpdatedAtField key={sectionIndex} index={sectionIndex} />}
            />
          </Stack>
        </Paper>
      </Stack>

      {previewOpen && <PreviewDialog sectionIndex={sectionIndex} onClose={() => setPreviewOpen(false)} />}
    </Stack>
  );
});
