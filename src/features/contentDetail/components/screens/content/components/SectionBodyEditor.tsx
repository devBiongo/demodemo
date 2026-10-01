import { useRef, useState, type ReactNode } from "react";
import { Box, Button, IconButton, Stack, Tooltip } from "@mui/material";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";
import {
  HybridHtmlEditor,
  type HybridEditorMode,
  type HybridHtmlEditorHandle,
} from "../../../hybrid-editor";
import { useContentForm } from "../../../../hooks/useContentForm";
import { useFieldAccess } from "../../../../hooks/useFieldAccess";
import { sectionField } from "../../../../utils/fieldPath";
import { CompareDialog } from "../../../modals/CompareDialog";

/**
 * 本文エディタ（HybridHtmlEditor）：上部は常に CKEditor のツールバー、下部はモードに応じて表示する
 * - source モード：Monaco（HTML ソース）。ツールバーは非活性
 * - wysiwyg モード：CKEditor 5
 * 2 つのエディタはどちらも一度だけ作成し、モード / section を切り替えても同じインスタンスを使う。
 */
type Props = {
  index: number;
  /** ツールバーの左側に表示する内容（タブ更新日時 など） */
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

  // TODO: 実際にファイルをアップロードした後、サーバーから返された URL でファイル名を置き換える
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
        {/* ボタンをクリックするとエディタからフォーカスが外れ、未書き戻しの内容が先にフォームへ書き戻される */}
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
        // ツールバーの「ソース」ボタンと「表示切替」は同じ mode を切り替える
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
