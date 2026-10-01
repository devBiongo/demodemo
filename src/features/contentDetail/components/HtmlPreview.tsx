import { Box } from '@mui/material';

type Props = {
  html: string;
  height: number | string;
};

/** 在沙箱 iframe 中渲染 HTML，不执行脚本 */
export function HtmlPreview({ html, height }: Props) {
  return (
    <Box
      component="iframe"
      title="preview"
      sandbox=""
      srcDoc={html}
      sx={{ display: 'block', width: '100%', height, border: 0, bgcolor: '#fff' }}
    />
  );
}
