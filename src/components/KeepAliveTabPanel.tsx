import { useState, type ReactNode } from 'react';
import { Box } from '@mui/material';

type Props = {
  active: boolean;
  children: ReactNode;
};

/**
 * 首次显示时才挂载，之后切换只隐藏（display: none）不卸载。
 * 再次切换回来时无需重新创建组件，编辑器的模式、撤销历史、滚动位置等也会保留。
 *
 * 注意：隐藏期间组件仍然挂载着，父组件重渲染时 children 也会跟着渲染，
 * 所以 children 应当用 memo 包裹（props 不变时跳过渲染）。
 */
export function KeepAliveTabPanel({ active, children }: Props) {
  const [mounted, setMounted] = useState(active);
  // 渲染期间更新自身 state：React 会立即以新 state 重新渲染，不会多一次提交
  if (active && !mounted) setMounted(true);
  if (!mounted) return null;

  return (
    <Box role="tabpanel" hidden={!active}>
      {children}
    </Box>
  );
}
