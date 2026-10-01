import { Box, ButtonBase } from "@mui/material";
// CKEditor 自带的「ソース」图标（只取 SVG 文字，不会把 ckeditor5 本体打进首屏）
import sourceIcon from "@ckeditor/ckeditor5-icons/theme/icons/source.svg?raw";

type Props = {
  /** source 模式中（按下状态） */
  pressed: boolean;
  disabled?: boolean;
  onClick: () => void;
};

/**
 * 切换 source / wysiwyg 的按钮。放在 CKEditor 工具栏的后面，外观与 CKEditor 的按钮一致
 * （颜色、尺寸都使用 CKEditor 的 CSS 变量，括号内为变量未加载时的默认值）。
 * 不属于 CKEditor，所以 CKEditor 工具栏非活性时也可以点击。
 */
export function SourceToggleButton({ pressed, disabled = false, onClick }: Props) {
  return (
    <>
      {/* 与 CKEditor 工具栏的分隔线相同 */}
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
          // 非活性：与 CKEditor 相同，图标和文字变淡
          "&.Mui-disabled > *": { opacity: "var(--ck-disabled-opacity, .5)" },
        }}
      >
        <Box
          component="span"
          // 静态的 SVG 资源（非用户输入）
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
