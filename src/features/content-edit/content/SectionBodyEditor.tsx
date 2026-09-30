import { useRef, useState, type ReactNode } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Tooltip,
} from "@mui/material";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";
import { DiffEditor, type OnMount } from "@monaco-editor/react";
import { useWatch } from "react-hook-form";
import type { editor } from "monaco-editor";
import { RHFCodeEditor } from "../../../components/form";
import { HtmlPreview } from "../../../components/HtmlPreview";
import { sectionField, useContentForm } from "../form";

type Props = {
  index: number;
  /** 工具栏左侧内容（タブ更新日時 等） */
  toolbarStart?: ReactNode;
};

type Mode = "source" | "preview";

export function SectionBodyEditor({ index, toolbarStart }: Props) {
  const { control } = useContentForm();
  const name = sectionField(index, "body");

  const [mode, setMode] = useState<Mode>("source");
  const [fullscreen, setFullscreen] = useState(false);
  const [diffOpen, setDiffOpen] = useState(false);
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleMount: OnMount = (ed) => {
    editorRef.current = ed;
  };

  // TODO: 实际上传文件后，用服务器返回的 URL 替换文件名
  const insertFiles = (files: FileList) => {
    const ed = editorRef.current;
    const selection = ed?.getSelection();
    if (!ed || !selection) return;
    const html = Array.from(files)
      .map((f) =>
        f.type.startsWith("image/")
          ? `<img src="${f.name}" alt="">`
          : `<a href="${f.name}">${f.name}</a>`,
      )
      .join("\n");
    ed.executeEdits("file-insert", [
      { range: selection, text: html, forceMoveMarkers: true },
    ]);
    ed.focus();
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
        <Button
          variant="contained"
          onClick={() =>
            setMode((m) => (m === "source" ? "preview" : "source"))
          }
        >
          表示切替
        </Button>
        <Button variant="contained" onClick={() => setDiffOpen(true)}>
          比較
        </Button>
        <Button
          variant="contained"
          disabled={mode !== "source"}
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
            onMount={handleMount}
          />
        ) : (
          <BodyPreview index={index} height={height} />
        )}
      </Box>

      {diffOpen && (
        <BodyDiffDialog index={index} onClose={() => setDiffOpen(false)} />
      )}
    </Box>
  );
}

function BodyPreview({
  index,
  height,
}: {
  index: number;
  height: number | string;
}) {
  const { control } = useContentForm();
  const html = useWatch({ control, name: sectionField(index, "body") });
  return <HtmlPreview html={html} height={height} />;
}

/** 与初始值（加载时的内容）比较 */
function BodyDiffDialog({
  index,
  onClose,
}: {
  index: number;
  onClose: () => void;
}) {
  const { getValues, formState } = useContentForm();
  const original =
    formState.defaultValues?.content?.sections?.[index]?.body ?? "";
  const modified = getValues(sectionField(index, "body"));

  return (
    <Dialog open fullWidth maxWidth="xl" onClose={onClose}>
      <DialogTitle>比較（左：保存済み / 右：編集中）</DialogTitle>
      <DialogContent>
        <DiffEditor
          height="70vh"
          language="html"
          original={original}
          modified={modified}
          options={{
            readOnly: true,
            renderSideBySide: true,
            minimap: { enabled: false },
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
