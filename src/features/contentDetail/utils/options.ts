import type { Option } from '../../../components/form';
import type { Attributes, Section } from './schema';

// ---------- コンテンツ ----------

export const CA_RULE_OPTIONS: Option<Section['caRule']>[] = [
  { value: 'html', label: 'HTMLコンテンツ' },
  { value: 'faq', label: 'FAQコンテンツ' },
  { value: 'none', label: '変換しない' },
];

type SectionFlagKey = { [K in keyof Section]: Section[K] extends boolean ? K : never }[keyof Section];

export const SECTION_FLAGS: { key: Exclude<SectionFlagKey, `${string}UseAi`>; label: string; help: string }[] = [
  { key: 'searchable', label: '検索対象', help: '検索結果に表示する' },
  { key: 'keepTabUpdatedAt', label: 'タブ更新日時そのまま', help: '保存時にタブ更新日時を更新しない' },
  { key: 'nda', label: 'NDAフラグ', help: 'NDA対象のコンテンツ' },
  { key: 'hiddenInStore', label: '店頭非公開', help: '店頭端末には表示しない' },
  { key: 'caStructured', label: 'CA構造化対象', help: 'CA構造化の対象にする' },
];

// ---------- 属性 ----------

export const VISIBILITY_OPTIONS: Option<Attributes['visibility']>[] = [
  { value: 'public', label: '公開' },
  { value: 'private', label: '非公開' },
];

export const STATUS_OPTIONS: Option<Attributes['status']>[] = [
  { value: 'draft', label: '作成中' },
  { value: 'review', label: '承認待ち' },
  { value: 'approved', label: '承認済み' },
];

export const AUTO_RECOMMEND_OPTIONS: Option<Attributes['autoRecommend']>[] = [
  { value: 'on', label: 'ON' },
  { value: 'off', label: 'OFF' },
];

export const END_STATUS_OPTIONS: Option<Attributes['endStatus']>[] = [
  { value: 'none', label: 'ラベルなし' },
  { value: 'closed', label: '受付終了' },
  { value: 'ended', label: '提供終了' },
];

// TODO: 実際のマスタに置き換える
export const FIXED_CONTENT_TYPE_OPTIONS: Option[] = [
  { value: '', label: '（なし）' },
  { value: 'guide', label: 'ご利用ガイド' },
  { value: 'campaign', label: 'キャンペーン' },
];

export const SUPPORT_CHAT_OPTIONS: Option<Attributes['supportChat']>[] = [
  { value: 'link', label: '連携する' },
  { value: 'unlink', label: '連携しない' },
];

export const CONTENT_TYPE_OPTIONS: Option<Attributes['contentType']>[] = [
  { value: 'html', label: 'HTML', help: 'HTML形式のコンテンツ' },
  { value: 'faq', label: 'FAQ', help: 'FAQ形式のコンテンツ' },
  { value: 'notice', label: 'お知らせ' },
];

export const NOTICE_TYPE_OPTIONS: Option<Exclude<Attributes['noticeType'], ''>>[] = [
  { value: 'new', label: '新規' },
  { value: 'update', label: '更新' },
  { value: 'repost', label: '再掲' },
];

// TODO: 実際のマスタに置き換える
export const SOURCE_OPTIONS: Option[] = [
  { value: 'online_shop', label: 'オンラインショップ' },
  { value: 'sms_pj', label: 'SMS拡大PJ' },
  { value: 'ivr', label: 'IVR' },
  { value: 'chat', label: 'チャット' },
  { value: 'store', label: '店頭' },
  { value: 'call_center', label: 'コールセンター' },
];
