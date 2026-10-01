import { Box, ButtonBase } from "@mui/material";
// CKEditor 標準の「ソース」アイコン（SVG の文字列だけを取り込み、ckeditor5 本体は初期表示の bundle に含めない）
import sourceIcon from "@ckeditor/ckeditor5-icons/theme/icons/source.svg?raw";

type Props = {
  /** source モード中（押下状態） */
  pressed: boolean;
  disabled?: boolean;
  onClick: () => void;
};

/**
 * source / wysiwyg を切り替えるボタン。CKEditor のツールバーの後ろに置き、見た目は CKEditor のボタンと同じ
 * （色・サイズは CKEditor の CSS 変数を使う。括弧内は変数が読み込まれていない場合の既定値）。
 * CKEditor の一部ではないので、CKEditor のツールバーが非活性でもクリックできる。
 */
export function SourceToggleButton({ pressed, disabled = false, onClick }: Props) {
  return (
    <>
      {/* CKEditor のツールバーの区切り線と同じ */}
      <Box
        sx={{
          flexShrink: 0,
          alignSelf: "stretch",
          width: "1px",
          my: "var(--ck-spacing-small, 0.3em)",
          bgcolor: "var(--ck-color-toolbar-border, hsl(0, 0%, 87.8%))",
        }}
      />
      <ButtonBase
        aria-pressed={pressed}
        disabled={disabled}
        onClick={onClick}
        disableRipple
        sx={{
          flexShrink: 0,
          mx: "var(--ck-spacing-small, 0.3em)",
          px: "var(--ck-spacing-tiny, 0.18em)",
          minHeight: "var(--ck-ui-component-min-height, 2.3em)",
          gap: "var(--ck-spacing-small, 0.3em)",
          fontFamily: "var(--ck-font-face, Helvetica, Arial, Tahoma, Verdana, sans-serif)",
          fontSize: "var(--ck-font-size-base, 13px)",
          borderRadius: "var(--ck-border-radius, 2px)",
          color: pressed ? "var(--ck-color-button-on-color, hsl(218.1, 100%, 58%))" : "var(--ck-color-text, hsl(0, 0%, 20%))",
          bgcolor: pressed ? "var(--ck-color-button-on-background, hsl(212, 100%, 97.1%))" : "transparent",
          "&:hover": {
            bgcolor: pressed
              ? "var(--ck-color-button-on-hover-background, hsl(211.7, 100%, 92.9%))"
              : "var(--ck-color-button-default-hover-background, hsl(0, 0%, 94.1%))",
          },
          "&:active": {
            bgcolor: pressed
              ? "var(--ck-color-button-on-active-background, hsl(211.7, 100%, 92.9%))"
              : "var(--ck-color-button-default-active-background, hsl(0, 0%, 94.1%))",
          },
          "&.Mui-focusVisible": {
            outline: "1px solid var(--ck-color-focus-border, hsl(208, 79%, 51%))",
          },
          // 非活性：CKEditor と同じく、アイコンと文字を薄くする
          "&.Mui-disabled > *": { opacity: "var(--ck-disabled-opacity, .5)" },
        }}
      >
        <Box
          component="span"
          // 静的な SVG リソース（ユーザー入力ではない）
          dangerouslySetInnerHTML={{ __html: sourceIcon }}
          sx={{
            display: "flex",
            "& svg": { width: 16, height: 16, fill: "currentColor" },
          }}
        />
        <span>ソース</span>
      </ButtonBase>
    </>
  );
}
