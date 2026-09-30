import { useCallback, useState } from 'react';
import { Box, Tab, Tabs, Typography } from '@mui/material';
import { KeepAliveTabPanel } from '../../components/KeepAliveTabPanel';
import { Header } from './components/Header';
import { ContentScreen } from './components/screens/content';
import { PropertyScreen } from './components/screens/property';
import { ContentFormProvider } from './contexts/ContentFormProvider';
import { useFormActions } from './hooks/useFormActions';
import { MAIN_TABS, type ErrorLocation, type MainTab } from './utils/tabs';

/** 在纵向 flex 容器中占满剩余高度（minHeight: 0 让内部可以出现滚动条） */
const FILL = { flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' } as const;

export function ContentDetailPage() {
  return (
    <ContentFormProvider>
      <ContentDetail />
    </ContentFormProvider>
  );
}

function ContentDetail() {
  const [tab, setTab] = useState<MainTab>('content');
  const [sectionIndex, setSectionIndex] = useState(0);

  const onInvalidLocated = useCallback((location: ErrorLocation) => {
    setTab(location.tab);
    if (location.section !== undefined) setSectionIndex(location.section);
  }, []);
  const { onSubmit, onDraft, onCancel } = useFormActions({ onInvalidLocated });

  return (
    // 整个页面固定为视口高度、不滚动；超出的内容在各 tab 内部滚动
    <Box
      component="form"
      noValidate
      onSubmit={onSubmit}
      sx={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
    >
      {/* 标题栏 + tab 栏：高度固定，始终显示在顶部 */}
      <Box sx={{ flexShrink: 0 }}>
        <Header onDraft={onDraft} onCancel={onCancel} />
        <Tabs
          value={tab}
          onChange={(_, v: MainTab) => setTab(v)}
          sx={{ px: 2, bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider' }}
        >
          {MAIN_TABS.map((t) => (
            <Tab key={t.value} value={t.value} label={t.label} />
          ))}
        </Tabs>
      </Box>

      {/* 占满剩余高度，底部与视口保持 4px。
          首次显示时挂载，之后只隐藏不卸载：再次切换时无需重建（尤其是编辑器） */}
      <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', px: 2, pt: 2, pb: 0.5 }}>
        <KeepAliveTabPanel active={tab === 'content'} sx={FILL}>
          <ContentScreen sectionIndex={sectionIndex} onSectionChange={setSectionIndex} />
        </KeepAliveTabPanel>
        {/* 属性：内容超出时在 tab 内滚动 */}
        <KeepAliveTabPanel active={tab === 'attributes'} sx={{ ...FILL, overflowY: 'auto' }}>
          <PropertyScreen />
        </KeepAliveTabPanel>
        {(tab === 'category' || tab === 'history') && <Typography color="text.secondary">未実装</Typography>}
      </Box>
    </Box>
  );
}
