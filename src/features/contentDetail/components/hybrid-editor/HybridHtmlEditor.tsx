import {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
  type Ref,
} from "react";
import { Box } from "@mui/material";
import type { DecoupledEditor } from "ckeditor5";
import type { editor } from "monaco-editor";
import type { Control, FieldPath, FieldValues } from "react-hook-form";
import { RHFDocumentEditor } from "../ckeditor";
import { RHFCodeEditor } from "../monaco";
import { SourceToggleButton } from "./SourceToggleButton";

export type HybridEditorMode = "source" | "wysiwyg";

export type HybridHtmlEditorProps<T extends FieldValues> = {
  name: FieldPath<T>;
  control: Control<T>;
  mode: HybridEditorMode;
  /** 全体の高さ（ツールバーを含む） */
  height: number | string;
  /** Monaco の model path：path ごとに内容・元に戻す履歴・カーソル位置を保持する */
  path: string;
  /** 非活性（読み取り専用） */
  disabled?: boolean;
  /** 指定した場合、CKEditor のツールバーの後ろにモード切替の「ソース」ボタンを表示する */
  onModeChange?: (mode: HybridEditorMode) => void;
  /** 「ソース」ボタンを非活性にする */
  modeSwitchDisabled?: boolean;
};

export type HybridHtmlEditorHandle = {
  /** 現在表示中のエディタのカーソル位置に HTML を挿入する */
  insertHtml: (html: string) => void;
};

/** ツールバーの高さ（CKEditor の読み込み完了前もこの高さを確保し、レイアウトのずれを防ぐ） */
const TOOLBAR_HEIGHT = 40;

/**
 * 見た目は 1 つのエディタ：上部は常に CKEditor のツールバー、下部は mode に応じて表示する
 * - wysiwyg：CKEditor の編集領域
 * - source：Monaco（このときツールバーは非活性：CKEditor のボタンは Monaco には効かない）
 * ツールバーの後ろの「ソース」ボタンは CKEditor の一部ではないので、source モードでもクリックできる。
 *
 * 2 つのエディタは一度作成したらずっと保持し、切替時は非表示にするだけで作り直さない。
 * 非表示の側はフォームの値を同期せず、切り替えて戻ったときに一度だけ読み込む（各エディタの active）。
 */
function HybridHtmlEditorInner<T extends FieldValues>(
  {
    name,
    control,
    mode,
    height,
    path,
    disabled = false,
    onModeChange,
    modeSwitchDisabled = false,
  }: HybridHtmlEditorProps<T>,
  ref: Ref<HybridHtmlEditorHandle>,
) {
  const [toolbarContainer, setToolbarContainer] = useState<HTMLElement | null>(
    null,
  );
  const ckEditorRef = useRef<DecoupledEditor | null>(null);
  const monacoRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  // Monaco は初めて source に切り替えたときに作成する（以降はずっと保持）
  const monacoUsedRef = useRef(false);
  monacoUsedRef.current ||= mode === "source";

  const modeRef = useRef(mode);
  modeRef.current = mode;
  useImperativeHandle(ref, () => ({
    insertHtml: (html) => {
      if (modeRef.current === "source") {
        const ed = monacoRef.current;
        const selection = ed?.getSelection();
        if (!ed || !selection) return;
        ed.executeEdits("insert-html", [
          { range: selection, text: html, forceMoveMarkers: true },
        ]);
        ed.focus();
      } else {
        const ed = ckEditorRef.current;
        if (!ed) return;
        ed.model.insertContent(ed.data.toModel(ed.data.processor.toView(html)));
        ed.editing.view.focus();
      }
    },
  }));

  const toolbarDisabled = disabled || mode === "source";
  /** 現在のモードのエディタだけを表示する */
  const layer = (visible: boolean) =>
    ({
      position: "absolute",
      inset: 0,
      display: visible ? "block" : "none",
    }) as const;

  return (
    <Box
      sx={{
        height,
        display: "flex",
        flexDirection: "column",
        border: 1,
        borderColor: "divider",
      }}
    >
      <Box
        sx={{
          flexShrink: 0,
          minHeight: TOOLBAR_HEIGHT,
          display: "flex",
          alignItems: "center",
          borderBottom: 1,
          borderColor: "divider",
          // 非活性：他の非活性の入力欄と同じ灰色の背景
          bgcolor: toolbarDisabled ? "grey.100" : undefined,
        }}
      >
        {/* CKEditor のツールバーはここに置く。幅はボタンの数に合わせ、「ソース」はその直後に続く。
            収まらない場合は縮み、はみ出したボタンは CKEditor が「⋮」にまとめる */}
        <Box
          ref={setToolbarContainer}
          sx={{
            flex: "0 1 auto",
            minWidth: 0,
            // ツールバー自体の枠線は外枠で代用する
            "& .ck.ck-toolbar": {
              border: 0,
              borderRadius: 0,
              bgcolor: toolbarDisabled ? "grey.100" : undefined,
            },
          }}
        />
        {onModeChange && (
          <SourceToggleButton
            pressed={mode === "source"}
            disabled={modeSwitchDisabled}
            onClick={() => onModeChange(mode === "source" ? "wysiwyg" : "source")}
          />
        )}
      </Box>
      <Box sx={{ flex: 1, minHeight: 0, position: "relative" }}>
        <Box sx={layer(mode === "wysiwyg")}>
          <RHFDocumentEditor
            control={control}
            name={name}
            toolbarContainer={toolbarContainer}
            disabled={disabled}
            active={mode === "wysiwyg"}
            onReady={(ed) => {
              ckEditorRef.current = ed;
            }}
          />
        </Box>
        {monacoUsedRef.current && (
          <Box sx={layer(mode === "source")}>
            <RHFCodeEditor
              control={control}
              name={name}
              height="100%"
              path={path}
              disabled={disabled}
              active={mode === "source"}
              onMount={(ed) => {
                monacoRef.current = ed;
              }}
            />
          </Box>
        )}
      </Box>
    </Box>
  );
}

/** CKEditor のツールバー + Monaco（HTML ソース）に切り替えられる編集領域 */
export const HybridHtmlEditor = forwardRef(HybridHtmlEditorInner) as <
  T extends FieldValues,
>(
  props: HybridHtmlEditorProps<T> & { ref?: Ref<HybridHtmlEditorHandle> },
) => ReturnType<typeof HybridHtmlEditorInner>;
