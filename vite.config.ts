import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // 编辑器各自单独成块（懒加载），便于缓存
        manualChunks: (id) => {
          if (/[\\/]node_modules[\\/](monaco-editor|@monaco-editor)[\\/]/.test(id)) return 'monaco';
          if (/[\\/]node_modules[\\/](ckeditor5|@ckeditor)[\\/]/.test(id)) return 'ckeditor';
          return undefined;
        },
      },
    },
  },
});
