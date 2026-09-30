import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// 注意：不要用 manualChunks 把编辑器库拆成具名 chunk。
// Rollup 会把 React 等共享依赖一并放进该 chunk，导致入口静态引用它，懒加载失效。
// 编辑器由 React.lazy 的 import() 自动拆分，已经是按需加载。
export default defineConfig({
  plugins: [react()],
  build: {
    // Monaco 等懒加载 chunk 本身较大，属预期
    chunkSizeWarningLimit: 4000,
  },
});
