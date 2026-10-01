import { useCallback, useMemo, useState } from 'react';
import { Box, Tab, Tabs, Typography } from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { KeepAliveTabPanel } from '../../components/KeepAliveTabPanel';
import { Header } from './components/Header';
import { ContentScreen } from './components/screens/content';
import { PropertyScreen } from './components/screens/property';
import { ContentDetailContext } from './hooks/useContentForm';
import { useFieldControl } from './hooks/useFieldControl';
import { useFormActions } from './hooks/useFormActions';
import { mockContent } from './utils/defaults';
import { createIsDisabled, evaluate, skipDisabledErrors, type FieldController } from './utils/fieldControl';
import { sectionField } from './utils/fieldPath';
import type { PageMode } from './utils/pageMode';
import { contentFormSchema, type ContentFormValues } from './utils/schema';
import { MAIN_TABS, type ErrorLocation, type MainTab } from './utils/tabs';

/** 在纵向 flex 容器中占满剩余高度（minHeight: 0 让内部可以出现滚动条） */
const FILL = { flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' } as const;

/**
 * 画面項目の活性 / 非活性と、値のクリアを決める。入力値が変わるたびに呼ばれる。
 * - disable / enable：活性状態だけを変える（値はそのまま）。何も指定しない項目は活性
 * - clear / keep：値だけを空にする（活性状態とは無関係）。通常は changed で条件を付ける
 * - selectSection：コンテンツ画面のタブを選択する。通常は changed で条件を付ける
 * - 同じ項目に複数回指定した場合は、後から呼んだものが優先
 * - 親を指定すると配下すべて（例：'content' はコンテンツ画面の全項目）
 * - 非活性の項目は送信時の検証をしない
 */
const controlFields: FieldController = ({ values, mode, changed }, field) => {
  const { content, attributes } = values;

  // システムが設定する項目
  field.disable('url', 'attributes.id', 'attributes.registeredAt', 'attributes.updatedAt', 'attributes.creator', 'attributes.updater');

  // コンテンツ種別「お知らせ」→ コンテンツ画面は 1 つ目のタブの概要文以外を非活性
  if (attributes.contentType === 'notice') {
    field.disable('content', 'action.fileInsert');
    field.enable(sectionField(0, 'summary'));
    // お知らせに切り替えた時点で、同じ範囲の値をクリアし、入力できる 1 つ目のタブを選択
    if (changed === 'attributes.contentType') {
      field.clear('content');
      field.keep(sectionField(0, 'summary'));
      field.selectSection(0);
    }
  }

  // 「ChatGPTを使用」→ 内容は自動生成するため入力不可
  if (content.titleKeywordUseAi) field.disable('content.titleKeyword');
  content.sections.forEach((s, i) => {
    if (s.summaryUseAi) field.disable(sectionField(i, 'summary'));
    if (s.keywordsUseAi) field.disable(sectionField(i, 'keywords'));
  });

  // 承認画面は参照のみ（最後に書く：これより前の enable もすべて上書き）
  if (mode === 'approval') {
    field.disableAll();
    // 参照・画面操作のボタンは使える
    field.enable(
      'action.cancel',
      'action.preview',
      'action.fullscreen',
      'action.switchMode',
      'action.compare',
      'action.compareClose',
    );
    // TODO: 承認時に編集できる項目 → field.enable(...)
  }
};

type Props = {
  mode: PageMode;
};

export function ContentDetailPage({ mode }: Props) {
  // 用 schema 统一校验（未挂载的 tab / section 里的字段也会被校验），非活性的项目除外
  const resolver = useMemo(
    () => skipDisabledErrors(zodResolver(contentFormSchema), (values) => createIsDisabled(evaluate(controlFields, { values, mode }).ops)),
    [mode],
  );
  const form = useForm<ContentFormValues>({
    // TODO: create の場合は空の初期値、edit / approval は API から取得した値
    defaultValues: mockContent,
    resolver,
  });

  const [tab, setTab] = useState<MainTab>('content');
  const [sectionIndex, setSectionIndex] = useState(0);

  const onInvalidLocated = useCallback((location: ErrorLocation) => {
    setTab(location.tab);
    if (location.section !== undefined) setSectionIndex(location.section);
  }, []);
  const { onSubmit, onDraft, onCancel } = useFormActions(form, { onInvalidLocated });
  const isDisabled = useFieldControl(form, mode, controlFields, { onSelectSection: setSectionIndex });
  // form 始终是同一个对象，所以只在活性状态变化时才生成新值
  const context = useMemo(() => ({ form, isDisabled }), [form, isDisabled]);

  return (
    // context 的值是稳定的，本组件重渲染（切换 tab 等）不会波及下层的 memo 组件
    <ContentDetailContext.Provider value={context}>
      {/* 整个页面固定为视口高度、不滚动；超出的内容在各 tab 内部滚动 */}
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
    </ContentDetailContext.Provider>
  );
}
