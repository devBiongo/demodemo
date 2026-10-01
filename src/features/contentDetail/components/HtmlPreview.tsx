import { Box } from '@mui/material';

type Props = {
  html: string;
  height: number | string;
};

/** サンドボックスの iframe で HTML を表示する（スクリプトは実行しない） */
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
