import { memo, useState } from "react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Paper,
  Stack,
} from "@mui/material";
import { RHFTextField } from "../../../components/form";
import { HtmlPreview } from "../../../components/HtmlPreview";
import { sectionField, useContentForm } from "../form";
import { AiAssistedField } from "./AiAssistedField";
import { SectionBodyEditor } from "./SectionBodyEditor";
import { SectionPanel, TabUpdatedAtField } from "./SectionPanel";
import { SectionTabs } from "./SectionTabs";

type Props = {
  sectionIndex: number;
  onSectionChange: (index: number) => void;
};

// memo：隐藏期间父组件（切换 tab 等）重渲染时跳过
export const ContentTab = memo(function ContentTab({
  sectionIndex,
  onSectionChange,
}: Props) {
  const { control } = useContentForm();
  const [previewOpen, setPreviewOpen] = useState(false);

  return (
    // 标题卡片 与 section tab 之间 8px。占满父容器高度，内容卡片在内部滚动
    <Stack spacing={1} sx={{ flex: 1, minHeight: 0 }}>
      <Paper variant="outlined" sx={{ p: 2, flexShrink: 0 }}>
        <Stack spacing={2}>
          <Stack direction="row" spacing={2} alignItems="flex-start">
            <RHFTextField
              control={control}
              name="content.title"
              placeholder="タイトル"
              fullWidth
            />
            <Button
              variant="contained"
              sx={{ flexShrink: 0, mt: 0.5 }}
              onClick={() => setPreviewOpen(true)}
            >
              プレビュー
            </Button>
          </Stack>
          <AiAssistedField
            aiName="content.titleKeywordUseAi"
            textName="content.titleKeyword"
            label="タイトルキーワード"
          />
        </Stack>
      </Paper>

      {/* tab 直接放在页面背景上，下方的卡片只包含内容区；tab 与卡片之间 4px。
          useFlexGap：用 gap 而不是 margin 实现间距，否则 Stack 会把子元素的 margin 重置为 0，
          SectionTabs 用来抵消内边距的 -2px margin 就会失效 */}
      <Stack spacing={0.5} useFlexGap sx={{ flex: 1, minHeight: 0 }}>
        <SectionTabs value={sectionIndex} onChange={onSectionChange} />
        {/* 占满剩余高度（底部贴近视口）；放不下时在卡片内部滚动 */}
        <Paper
          variant="outlined"
          sx={{ flex: 1, minHeight: 0, overflowY: "auto", mb: 1 }}
        >
          {/* useFlexGap：用 gap 实现间距。否则 Stack 给子元素加的 margin-top 会让
              全屏编辑（position: fixed; inset: 0）的编辑器顶部空出 16px */}
          <Stack spacing={2} useFlexGap sx={{ p: 2 }} role="tabpanel">
            {/* 普通字段：key 切换时重新挂载，各 section 互不干扰 */}
            <SectionPanel key={sectionIndex} index={sectionIndex} />
            {/* 编辑器：不加 key，切换 section 时复用同一实例 */}
            <SectionBodyEditor
              index={sectionIndex}
              toolbarStart={
                <TabUpdatedAtField key={sectionIndex} index={sectionIndex} />
              }
            />
          </Stack>
        </Paper>
      </Stack>

      {previewOpen && (
        <PreviewDialog
          sectionIndex={sectionIndex}
          onClose={() => setPreviewOpen(false)}
        />
      )}
    </Stack>
  );
});

function PreviewDialog({
  sectionIndex,
  onClose,
}: {
  sectionIndex: number;
  onClose: () => void;
}) {
  const { getValues } = useContentForm();
  const [title, body] = getValues([
    "content.title",
    sectionField(sectionIndex, "body"),
  ]);

  return (
    <Dialog open fullWidth maxWidth="lg" onClose={onClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent dividers>
        <HtmlPreview html={body} height="70vh" />
      </DialogContent>
    </Dialog>
  );
}
