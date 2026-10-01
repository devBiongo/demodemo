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
  /** 整体高度（含工具栏） */
  height: number | string;
  /** Monaco 的 model path：每个 path 保留各自的内容、撤销历史、光标位置 */
  path: string;
  /** 非活性（只读） */
  disabled?: boolean;
  /** 指定时，在 CKEditor 工具栏的后面显示切换模式的「ソース」按钮 */
  onModeChange?: (mode: HybridEditorMode) => void;
  /** 「ソース」按钮非活性 */
  modeSwitchDisabled?: boolean;
};

export type HybridHtmlEditorHandle = {
  /** 在当前显示的编辑器的光标处插入 HTML */
  insertHtml: (html: string) => void;
};

/** 工具栏高度（CKEditor 加载完成前也占住这个高度，避免布局跳动） */
const TOOLBAR_HEIGHT = 40;

/**
 * 看起来是一个编辑器：上方始终是 CKEditor 的工具栏，下方根据 mode 显示
 * - wysiwyg：CKEditor 的编辑区
 * - source：Monaco（此时工具栏非活性：CKEditor 的按钮对 Monaco 无效）
 * 工具栏后面的「ソース」按钮不属于 CKEditor，source 模式下也可以点击。
 *
 * 两个编辑器创建后都一直保留，切换时只隐藏，不重建。
 * 隐藏的一方不同步表单值，切换回来时才读取一次（各编辑器的 active）。
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
  // Monaco 第一次切到 source 时才创建（之后一直保留）
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
  /** 只显示当前模式的编辑器 */
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
          // 非活性：与其他非活性输入框相同的灰色背景
          bgcolor: toolbarDisabled ? "grey.100" : undefined,
        }}
      >
        {/* CKEditor 的工具栏放在这里。宽度随按钮数量，「ソース」紧跟在后面；
            放不下时收缩，多出的按钮由 CKEditor 收进「⋮」 */}
        <Box
          ref={setToolbarContainer}
          sx={{
            flex: "0 1 auto",
            minWidth: 0,
            // 工具栏本身的边框由外框代替
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

/** CKEditor 的工具栏 + 可切换为 Monaco（HTML 源码）的编辑区 */
export const HybridHtmlEditor = forwardRef(HybridHtmlEditorInner) as <
  T extends FieldValues,
>(
  props: HybridHtmlEditorProps<T> & { ref?: Ref<HybridHtmlEditorHandle> },
) => ReturnType<typeof HybridHtmlEditorInner>;
