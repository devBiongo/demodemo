import { useRef, useState, type ReactNode } from "react";
import { Box, Button, IconButton, Stack, Tooltip } from "@mui/material";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";
import {
  HybridHtmlEditor,
  type HybridEditorMode,
  type HybridHtmlEditorHandle,
} from "../../../../../../components/hybrid-editor";
import { useContentForm } from "../../../../hooks/useContentForm";
import { useFieldAccess } from "../../../../hooks/useFieldAccess";
import { sectionField } from "../../../../utils/fieldPath";
import { CompareDialog } from "../../../modals/CompareDialog";

/**
 * 正文编辑器（HybridHtmlEditor）：上方始终是 CKEditor 的工具栏，下方按模式显示
 * - source 模式：Monaco（HTML 源码），工具栏非活性
 * - wysiwyg 模式：CKEditor 5
 * 两个编辑器都只创建一次，切换模式 / section 时复用同一实例。
 */
type Props = {
  index: number;
  /** 工具栏左侧内容（タブ更新日時 等） */
  toolbarStart?: ReactNode;
};

export function SectionBodyEditor({ index, toolbarStart }: Props) {
  const { control } = useContentForm();
  const name = sectionField(index, "body");
  const { isDisabled } = useFieldAccess();

  const [mode, setMode] = useState<HybridEditorMode>("source");
  const [fullscreen, setFullscreen] = useState(false);
  const [compareOpen, setCompareOpen] = useState(false);
  const editorRef = useRef<HybridHtmlEditorHandle>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // TODO: 实际上传文件后，用服务器返回的 URL 替换文件名
  const insertFiles = (files: FileList) => {
    const html = Array.from(files)
      .map((f) =>
        f.type.startsWith("image/")
          ? `<img src="${f.name}" alt="">`
          : `<a href="${f.name}">${f.name}</a>`,
      )
      .join("\n");
    editorRef.current?.insertHtml(html);
  };

  const switchMode = () => setMode((m) => (m === "source" ? "wysiwyg" : "source"));

  const height = fullscreen ? "calc(100vh - 72px)" : 480;

  return (
    <Box
      sx={
        fullscreen
          ? {
              position: "fixed",
              inset: 0,
              zIndex: (t) => t.zIndex.modal,
              bgcolor: "background.paper",
              p: 2,
            }
          : undefined
      }
    >
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
        {toolbarStart}
        <Box sx={{ flex: 1 }} />
        <Tooltip title={fullscreen ? "全画面を終了" : "全画面"}>
          {/* 非活性のボタンはイベントを受け取らないため、Tooltip 用に span で包む */}
          <span>
            <IconButton color="primary" disabled={isDisabled("action.fullscreen")} onClick={() => setFullscreen((v) => !v)}>
              {fullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
            </IconButton>
          </span>
        </Tooltip>
        <Button variant="contained" disabled={isDisabled("action.switchMode")} onClick={switchMode}>
          表示切替
        </Button>
        {/* 点击按钮时编辑器失焦，未写回的内容会先写回表单 */}
        <Button variant="contained" disabled={isDisabled("action.compare")} onClick={() => setCompareOpen(true)}>
          比較
        </Button>
        <Button
          variant="contained"
          disabled={isDisabled("action.fileInsert")}
          onClick={() => fileInputRef.current?.click()}
        >
          ファイル挿入
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          hidden
          onChange={(e) => {
            if (e.target.files?.length) insertFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </Stack>

      <HybridHtmlEditor
        ref={editorRef}
        control={control}
        name={name}
        mode={mode}
        height={height}
        path={`section-${index}.html`}
        disabled={isDisabled(name)}
        // 工具栏的「ソース」按钮与「表示切替」切换同一个 mode
        onModeChange={setMode}
        modeSwitchDisabled={isDisabled("action.switchMode")}
      />

      {compareOpen && (
        <CompareDialog
          initialIndex={index}
          onClose={() => setCompareOpen(false)}
        />
      )}
    </Box>
  );
}
