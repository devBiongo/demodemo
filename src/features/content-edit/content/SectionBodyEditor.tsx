import { useRef, useState, type ReactNode } from "react";
import { Box, Button, IconButton, Stack, Tooltip } from "@mui/material";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";
import type { OnMount } from "@monaco-editor/react";
import type { ClassicEditor } from "ckeditor5";
import { RHFRichTextEditor } from "../../../components/ckeditor";
import { RHFCodeEditor } from "../../../components/monaco";
import { sectionField, useContentForm } from "../form";

/**
 * 正文编辑器：
 * - source 模式：Monaco（HTML 源码）。切换 section 时复用同一实例，只切换 model（path）
 * - wysiwyg 模式：CKEditor 5
 * 两个编辑器都是非受控的，切换模式时卸载的一方会先把内容写回表单。
 */
type Props = {
  index: number;
  /** 工具栏左侧内容（タブ更新日時 等） */
  toolbarStart?: ReactNode;
};

type Mode = "source" | "wysiwyg";

type InsertHtml = (html: string) => void;

export function SectionBodyEditor({ index, toolbarStart }: Props) {
  const { control } = useContentForm();
  const name = sectionField(index, "body");

  const [mode, setMode] = useState<Mode>("source");
  const [fullscreen, setFullscreen] = useState(false);
  /** 当前编辑器的「在光标处插入 HTML」实现，由各编辑器就绪时注册 */
  const insertHtmlRef = useRef<InsertHtml | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleMonacoMount: OnMount = (ed) => {
    insertHtmlRef.current = (html) => {
      const selection = ed.getSelection();
      if (!selection) return;
      ed.executeEdits("file-insert", [
        { range: selection, text: html, forceMoveMarkers: true },
      ]);
      ed.focus();
    };
  };

  const handleCkEditorReady = (editor: ClassicEditor) => {
    insertHtmlRef.current = (html) => {
      const viewFragment = editor.data.processor.toView(html);
      editor.model.insertContent(editor.data.toModel(viewFragment));
      editor.editing.view.focus();
    };
  };

  // TODO: 实际上传文件后，用服务器返回的 URL 替换文件名
  const insertFiles = (files: FileList) => {
    const html = Array.from(files)
      .map((f) =>
        f.type.startsWith("image/")
          ? `<img src="${f.name}" alt="">`
          : `<a href="${f.name}">${f.name}</a>`,
      )
      .join("\n");
    insertHtmlRef.current?.(html);
  };

  const switchMode = () => {
    insertHtmlRef.current = null;
    setMode((m) => (m === "source" ? "wysiwyg" : "source"));
  };

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
          <IconButton color="primary" onClick={() => setFullscreen((v) => !v)}>
            {fullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
          </IconButton>
        </Tooltip>
        <Button variant="contained" onClick={switchMode}>
          表示切替
        </Button>
        {/* TODO: 比較（保存済みの内容との差分表示） */}
        <Button variant="contained">比較</Button>
        <Button
          variant="contained"
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

      <Box sx={{ border: 1, borderColor: "divider" }}>
        {mode === "source" ? (
          <RHFCodeEditor
            control={control}
            name={name}
            height={height}
            path={`section-${index}.html`}
            onMount={handleMonacoMount}
          />
        ) : (
          <RHFRichTextEditor
            control={control}
            name={name}
            height={height}
            onReady={handleCkEditorReady}
          />
        )}
      </Box>
    </Box>
  );
}
