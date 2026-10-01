import { monaco } from "./setup";
import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
} from "react";
import Editor, { type EditorProps, type OnMount } from "@monaco-editor/react";
import { Box, type SxProps, type Theme } from "@mui/material";
import {
  useController,
  type Control,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";
import type { editor } from "monaco-editor";
import type { RHFCodeEditorProps } from "./RHFCodeEditor";
import { writeField } from "../form/writeField";

const DEFAULT_OPTIONS: EditorProps["options"] = {
  minimap: { enabled: false },
  fontSize: 13,
  wordWrap: "on",
  automaticLayout: true,
  scrollBeyondLastLine: false,
};

/** 非活性時：入力・カーソル・行ハイライト等をすべて止める */
const DISABLED_OPTIONS: EditorProps["options"] = {
  readOnly: true,
  domReadOnly: true,
  renderLineHighlight: "none",
  matchBrackets: "never",
  occurrencesHighlight: "off",
  selectionHighlight: false,
  links: false,
  hover: { enabled: false },
};

/** 非活性時の見た目：他の非活性入力欄と同じ灰色の背景 + 薄い文字、カーソルと「読み取り専用」メッセージを隠す */
const disabledSx: SxProps<Theme> = (t) => ({
  "& .monaco-editor": {
    "--vscode-editor-background": t.palette.grey[100],
    "--vscode-editorGutter-background": t.palette.grey[100],
  },
  "& .monaco-editor .view-lines, & .monaco-editor .margin-view-overlays": { opacity: 0.55 },
  "& .monaco-editor .cursors-layer, & .monaco-editor-overlaymessage": { display: "none" },
});

type Pending = { model: editor.ITextModel; name: string };

/**
 * 非制御の Monaco エディタ：
 * - 入力中は React のレンダリングを発生させず、debounceMs のデバウンスでフォームに書き戻す。フォーカスが外れた時 / name 切替 / アンマウント時はすぐに書き戻す
 * - フォームの値が外部で変更された（reset、setValue など）ときはエディタに反映する
 * - name/path が変わっても同じエディタインスタンスを使い、model だけを切り替える
 *
 * 注意：react-hook-form 7.55 の useController / useWatch は name の変化に追従しない
 * （購読は最初の name でのみ作られる）。そのため項目の値の読み取りは name を key とする FieldBinding で行い、
 * name が変わると FieldBinding が再マウントされ、必ず現在の項目の値を読み取る。
 */
export default function RHFCodeEditorImpl<T extends FieldValues>({
  name,
  control,
  height,
  language = "html",
  path,
  onMount,
  options,
  disabled = false,
  active = true,
  debounceMs = 300,
}: RHFCodeEditorProps<T>) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const [ready, setReady] = useState(false);

  const nameRef = useRef(name);
  nameRef.current = name;
  const pendingRef = useRef<Pending | null>(null);
  const timerRef = useRef<number>();
  /** その model の内容と一致していることが分かっているフォームの値。自分で書き戻したことによる同期をスキップするために使う */
  const syncedRef = useRef({ uri: "", value: "" });
  /** フォームの値で初期化済みの model */
  const initializedRef = useRef(new Set<string>());
  /** プログラムで model を同期している間は change を無視する */
  const suppressRef = useRef(false);
  const pathsRef = useRef(new Set<string>());
  pathsRef.current.add(path);

  // 以下の 2 つの関数は ref にしか依存しないので、一度登録すればずっと使える
  const flushRef = useRef(() => {
    window.clearTimeout(timerRef.current);
    const pending = pendingRef.current;
    pendingRef.current = null;
    if (!pending || pending.model.isDisposed()) return;
    const value = pending.model.getValue();
    syncedRef.current = { uri: pending.model.uri.toString(), value };
    writeField(control, pending.name as FieldPath<T>, value);
  });

  /** 現在の項目のフォームの値を現在の model に反映する */
  const syncRef = useRef((value: string) => {
    const model = editorRef.current?.getModel();
    if (!model) return;
    const uri = model.uri.toString();
    if (syncedRef.current.uri === uri && syncedRef.current.value === value)
      return;
    if (pendingRef.current?.model === model) {
      // 外部での変更を優先し、未書き戻しの入力は破棄する
      window.clearTimeout(timerRef.current);
      pendingRef.current = null;
    }
    if (model.getValue() !== value) {
      suppressRef.current = true;
      if (initializedRef.current.has(uri)) {
        // 外部での変更：1 回の編集として扱い、元に戻せる
        model.pushEditOperations(
          [],
          [{ range: model.getFullModelRange(), text: value }],
          () => null,
        );
      } else {
        // 初回の読み込み：元に戻す履歴には入れない
        model.setValue(value);
      }
      suppressRef.current = false;
    }
    initializedRef.current.add(uri);
    syncedRef.current = { uri, value };
  });

  const handleMount: OnMount = (ed, m) => {
    editorRef.current = ed;
    ed.onDidChangeModelContent(() => {
      if (suppressRef.current) return;
      const model = ed.getModel();
      if (!model) return;
      pendingRef.current = { model, name: nameRef.current };
      window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(flushRef.current, debounceMs);
    });
    ed.onDidBlurEditorText(() => flushRef.current());
    setReady(true);
    onMount?.(ed, m);
  };

  // 項目の切替やアンマウントの前に、未書き戻しの内容を元の項目に書き戻す
  useEffect(() => () => flushRef.current(), [name]);
  // 非表示になったらすぐに書き戻す：layout effect は他のエディタの同期（passive effect）より先に実行される
  useLayoutEffect(() => {
    if (!active) flushRef.current();
  }, [active]);

  // アンマウント時に、このコンポーネントが作成したすべての model を破棄する（エディタ自身の破棄の後に行う。
  // StrictMode の疑似アンマウントの後はすぐに再マウントされるので、その場合はスキップ）
  const mountedRef = useRef(false);
  useEffect(() => {
    mountedRef.current = true;
    const paths = pathsRef.current;
    return () => {
      mountedRef.current = false;
      window.setTimeout(() => {
        if (mountedRef.current) return;
        paths.forEach((p) =>
          monaco.editor.getModel(monaco.Uri.parse(p))?.dispose(),
        );
      });
    };
  }, []);

  const mergedOptions = useMemo(
    () => ({ ...DEFAULT_OPTIONS, ...options, ...(disabled ? DISABLED_OPTIONS : undefined) }),
    [options, disabled],
  );

  return (
    // 外枠はエディタと同じ高さ：height がパーセント指定の場合、このコンポーネントの親要素が基準になる
    <Box style={{ height }} sx={disabled ? disabledSx : undefined}>
      {/* model は Editor が path ごとに作成し（初期は空）、内容は FieldBinding が同期する */}
      <Editor
        height={height}
        language={language}
        path={path}
        onMount={handleMount}
        options={mergedOptions}
      />
      {/* Editor の後ろに置く：その effect は Editor が model を切り替えた後に実行される */}
      <FieldBinding
        key={name}
        control={control}
        name={name}
        enabled={ready && active}
        syncRef={syncRef}
      />
    </Box>
  );
}

type FieldBindingProps<T extends FieldValues> = {
  control: Control<T>;
  name: FieldPath<T>;
  /** エディタの準備ができていて、表示中 */
  enabled: boolean;
  syncRef: MutableRefObject<(value: string) => void>;
};

/** 1 つの項目の値を購読し、変わったらエディタに反映する。name を key にして使う */
function FieldBinding<T extends FieldValues>({
  control,
  name,
  enabled,
  syncRef,
}: FieldBindingProps<T>) {
  const { field } = useController({ control, name });
  const value: string = field.value ?? "";

  useEffect(() => {
    if (enabled) syncRef.current(value);
  }, [enabled, value, syncRef]);

  return null;
}
