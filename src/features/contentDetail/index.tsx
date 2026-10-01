import { useCallback, useMemo, useState } from "react";
import { Box, Tab, Tabs, Typography } from "@mui/material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { KeepAliveTabPanel } from "./components/KeepAliveTabPanel";
import { Header } from "./components/Header";
import { ContentScreen } from "./components/screens/content";
import { PropertyScreen } from "./components/screens/property";
import { ContentDetailContext } from "./hooks/useContentForm";
import { useFieldControl } from "./hooks/useFieldControl";
import { useFormActions } from "./hooks/useFormActions";
import { mockContent } from "./utils/defaults";
import { fieldRules } from "./fieldRules";
import { createIsDisabled, evaluate, skipDisabledErrors } from "./utils/fieldControl";
import type { PageMode } from "./utils/pageMode";
import { contentFormSchema, type ContentFormValues } from "./utils/schema";
import { MAIN_TABS, type ErrorLocation, type MainTab } from "./utils/tabs";

/** 縦方向の flex コンテナで残りの高さを埋める（minHeight: 0 で内部にスクロールバーを出せる） */
const FILL = {
  flex: 1,
  minHeight: 0,
  display: "flex",
  flexDirection: "column",
} as const;

type Props = {
  mode: PageMode;
};

export function ContentDetailPage({ mode }: Props) {
  // schema でまとめて検証する（未マウントのタブ / section の項目も検証される）。非活性の項目は除く
  const resolver = useMemo(
    () =>
      skipDisabledErrors(zodResolver(contentFormSchema), (values) =>
        createIsDisabled(evaluate(fieldRules, { values, mode }).ops),
      ),
    [mode],
  );
  const form = useForm<ContentFormValues>({
    // TODO: create の場合は空の初期値、edit / approval は API から取得した値
    defaultValues: mockContent,
    resolver,
  });

  const [tab, setTab] = useState<MainTab>("content");
  const [sectionIndex, setSectionIndex] = useState(0);

  const onInvalidLocated = useCallback((location: ErrorLocation) => {
    setTab(location.tab);
    if (location.section !== undefined) setSectionIndex(location.section);
  }, []);
  const { onSubmit, onDraft, onCancel } = useFormActions(form, {
    onInvalidLocated,
  });
  const isDisabled = useFieldControl(form, mode, fieldRules, {
    onSelectSection: setSectionIndex,
  });
  // form は常に同じオブジェクトなので、活性状態が変わったときだけ新しい値を作る
  const context = useMemo(() => ({ form, isDisabled }), [form, isDisabled]);

  return (
    // context の値は安定しているため、このコンポーネントの再レンダリング（タブ切替など）は下層の memo コンポーネントに波及しない
    <ContentDetailContext.Provider value={context}>
      {/* ページ全体をビューポートの高さに固定し、スクロールしない。はみ出す内容は各タブの内部でスクロール */}
      <Box
        component="form"
        noValidate
        onSubmit={onSubmit}
        sx={{
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* タイトルバー + タブバー：高さ固定で、常に上部に表示 */}
        <Box sx={{ flexShrink: 0 }}>
          <Header onDraft={onDraft} onCancel={onCancel} />
          <Tabs
            value={tab}
            onChange={(_, v: MainTab) => setTab(v)}
            sx={{
              px: 2,
              bgcolor: "background.paper",
              borderBottom: 1,
              borderColor: "divider",
            }}
          >
            {MAIN_TABS.map((t) => (
              <Tab key={t.value} value={t.value} label={t.label} />
            ))}
          </Tabs>
        </Box>

        {/* 残りの高さを埋め、下端はビューポートと 4px 空ける。
            初めて表示したときにマウントし、以降は非表示にするだけでアンマウントしない：再度切り替えても作り直さない（特にエディタ） */}
        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
            px: 2,
            pt: 2,
            pb: 0.5,
          }}
        >
          <KeepAliveTabPanel active={tab === "content"} sx={FILL}>
            <ContentScreen
              sectionIndex={sectionIndex}
              onSectionChange={setSectionIndex}
            />
          </KeepAliveTabPanel>
          {/* 属性：内容がはみ出す場合はタブ内でスクロール */}
          <KeepAliveTabPanel
            active={tab === "attributes"}
            sx={{ ...FILL, overflowY: "auto" }}
          >
            <PropertyScreen />
          </KeepAliveTabPanel>
          {(tab === "category" || tab === "history") && (
            <Typography color="text.secondary">未実装</Typography>
          )}
        </Box>
      </Box>
    </ContentDetailContext.Provider>
  );
}
