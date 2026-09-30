import { Dialog, DialogContent, DialogTitle } from '@mui/material';
import { HtmlPreview } from '../../../../components/HtmlPreview';
import { useContentForm } from '../../hooks/useContentForm';
import { sectionField } from '../../utils/fieldPath';

type Props = {
  sectionIndex: number;
  onClose: () => void;
};

/** タイトル + 当前 section 正文的预览（打开时取一次值） */
export function PreviewDialog({ sectionIndex, onClose }: Props) {
  const { getValues } = useContentForm();
  const [title, body] = getValues(['content.title', sectionField(sectionIndex, 'body')]);

  return (
    <Dialog open fullWidth maxWidth="lg" onClose={onClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent dividers>
        <HtmlPreview html={body} height="70vh" />
      </DialogContent>
    </Dialog>
  );
}
