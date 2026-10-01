import { useState, type ReactNode } from 'react';
import { Box, type SxProps, type Theme } from '@mui/material';

type Props = {
  active: boolean;
  children: ReactNode;
  /** 表示中に適用するスタイル（レイアウト用）。非表示時は適用しない（display などが hidden を上書きしないように） */
  sx?: SxProps<Theme>;
};

/**
 * 初めて表示したときにマウントし、以降の切替では非表示（display: none）にするだけでアンマウントしない。
 * 再度切り替えてもコンポーネントを作り直さず、エディタのモード・元に戻す履歴・スクロール位置なども保持される。
 *
 * 注意：非表示の間もコンポーネントはマウントされたままで、親が再レンダリングされると children もレンダリングされる。
 * そのため children は memo で包むこと（props が変わらなければレンダリングをスキップ）。
 */
export function KeepAliveTabPanel({ active, children, sx }: Props) {
  const [mounted, setMounted] = useState(active);
  // レンダリング中に自身の state を更新：React は新しい state ですぐに再レンダリングし、コミットは増えない
  if (active && !mounted) setMounted(true);
  if (!mounted) return null;

  return (
    <Box role="tabpanel" hidden={!active} sx={active ? sx : undefined}>
      {children}
    </Box>
  );
}
