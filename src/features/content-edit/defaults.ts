import { SECTION_COUNT, type ContentFormValues, type Section } from './schema';

export const createEmptySection = (): Section => ({
  name: '',
  summary: '',
  summaryUseAi: false,
  keywords: '',
  keywordsUseAi: false,
  toc: '',
  related: '',
  officialSite: '',
  manualRecommend: '',
  caRule: 'html',
  searchable: true,
  keepTabUpdatedAt: false,
  nda: false,
  hiddenInStore: false,
  caStructured: false,
  tabUpdatedAt: '',
  body: '',
});

const createSections = (overrides: Partial<Section>[]): Section[] =>
  Array.from({ length: SECTION_COUNT }, (_, i) => ({ ...createEmptySection(), ...overrides[i] }));

// TODO: API から取得したデータに置き換える
export const mockContent: ContentFormValues = {
  url: '/contents/10021851/1',
  content: {
    title: '【M／YM】Glance',
    titleKeyword: 'Glance',
    titleKeywordUseAi: true,
    sections: createSections([
      {
        name: '概要',
        summary:
          'Glanceは、対応スマートフォンのロック画面にニュースやゲームなど多彩なコンテンツを無料配信し、AIによるファッション提案機能も備えたサービスです。',
        summaryUseAi: true,
        keywords: '(ロック画面),(壁紙配信サービス),(AI Looks),(ファッションコーディネート提案),(対応端末メーカー)',
        keywordsUseAi: true,
        toc: '<li><a href="#01">概要</a></li>',
        keepTabUpdatedAt: true,
        caStructured: true,
        tabUpdatedAt: '2026-07-21T09:30',
        body: `<div id="wrapper">
  <div id="container">
    <div id="main">
      <div class="brand_ico shop_ng"><img src="/KNC/CSCALL/common/img/icon/8228566.png"><img src="/KNC/CSCALL/common/img/icon/13000919.gif"></div>
      <div class="upd_title s" style="width:150px;">更新履歴／お知らせ</div>
      <div class="upd_scroll">
        <div class="upd_scroll_main">
          <p>2026/07/21</p>
          <ul class="mark">
            <li>利用方法やおすすめポイントについて更新</li>
          </ul>
          <hr class="quarter">
          <p>2026/05/11</p>
          <ul class="mark">
            <li>対象機種、設定方法、利用方法 を更新</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</div>
`,
      },
      {},
      { name: '質問集' },
    ]),
  },
  attributes: {
    id: '10021851',
    visibility: 'public',
    publishStart: { date: '2026-07-21', hour: '09', minute: '30' },
    publishEnd: { date: '9999-12-31', hour: '00', minute: '00' },
    registeredAt: { date: '2023-04-12', hour: '11', minute: '11' },
    updatedAt: { date: '2023-04-12', hour: '11', minute: '11' },
    status: 'draft',
    autoRecommend: 'on',
    endStatus: 'none',
    creator: '削除ユーザー',
    updater: 'テストユーザー',
    fixedContentType: '',
    importance: '0',
    supportChat: 'link',
    skillId: '',
    keepUpdatedAt: true,
    undeletable: false,
    contentType: 'html',
    noticeType: '',
    pickup: false,
    noticeLink: '',
    history: '',
    owner: '',
    manual: '',
    imageFiles: '',
    externalLinks: '',
    sources: [],
  },
};
