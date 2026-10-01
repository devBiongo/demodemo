import { z } from 'zod';

export const SECTION_COUNT = 6;

// ---------- 共通 ----------

const hour = z.string().regex(/^([01]?\d|2[0-3])$/, '0〜23');
const minute = z.string().regex(/^[0-5]?\d$/, '0〜59');

const dateTimePartsSchema = z.object({ date: z.string(), hour, minute });
const requiredDateTimeSchema = dateTimePartsSchema.extend({
  date: z.string().min(1, '日付を入力してください'),
});

type DateTimeParts = z.infer<typeof dateTimePartsSchema>;

/** 比較用："YYYY-MM-DDTHH:mm" 形式の文字列に変換する（辞書順 = 時間順） */
const toSortable = ({ date, hour, minute }: DateTimeParts) =>
  `${date}T${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`;

// ---------- コンテンツ ----------

export const sectionSchema = z.object({
  name: z.string().max(20, '20文字以内で入力してください'),
  summary: z.string(),
  summaryUseAi: z.boolean(),
  keywords: z.string(),
  keywordsUseAi: z.boolean(),
  toc: z.string(),
  related: z.string(),
  officialSite: z.string(),
  manualRecommend: z.string(),
  // ''：クリアされた状態（index.tsx の controlFields）
  caRule: z.enum(['html', 'faq', 'none', '']),
  searchable: z.boolean(),
  keepTabUpdatedAt: z.boolean(),
  nda: z.boolean(),
  hiddenInStore: z.boolean(),
  caStructured: z.boolean(),
  tabUpdatedAt: z.string(),
  body: z.string(),
});

export const contentSchema = z.object({
  title: z.string().trim().min(1, 'タイトルを入力してください').max(100, '100文字以内で入力してください'),
  titleKeyword: z.string(),
  titleKeywordUseAi: z.boolean(),
  sections: z.array(sectionSchema).length(SECTION_COUNT),
});

// ---------- 属性 ----------

export const attributesSchema = z
  .object({
    id: z.string(),
    visibility: z.enum(['public', 'private']),
    publishStart: requiredDateTimeSchema,
    publishEnd: requiredDateTimeSchema,
    registeredAt: dateTimePartsSchema,
    updatedAt: dateTimePartsSchema,
    status: z.enum(['draft', 'review', 'approved']),
    autoRecommend: z.enum(['on', 'off']),
    endStatus: z.enum(['none', 'closed', 'ended']),
    creator: z.string(),
    updater: z.string(),
    fixedContentType: z.string(),
    importance: z.string().regex(/^\d*$/, '数値を入力してください'),
    supportChat: z.enum(['link', 'unlink']),
    skillId: z.string(),
    keepUpdatedAt: z.boolean(),
    undeletable: z.boolean(),
    contentType: z.enum(['html', 'faq', 'notice']),
    noticeType: z.enum(['', 'new', 'update', 'repost']),
    pickup: z.boolean(),
    noticeLink: z.string(),
    history: z.string(),
    owner: z.string(),
    manual: z.string(),
    imageFiles: z.string(),
    externalLinks: z.string(),
    sources: z.array(z.string()),
  })
  .refine((a) => toSortable(a.publishEnd) >= toSortable(a.publishStart), {
    path: ['publishEnd', 'date'],
    message: '公開開始日以降を指定してください',
  })
  .refine((a) => a.contentType !== 'html' || a.history.split('\n').length <= 3, {
    path: ['history'],
    message: 'コンテンツ種別が「html」の場合は最大3行までです',
  });

// ---------- 全体 ----------

// 非活性の項目はチェックしない（エラーを除外する）：utils/fieldControl.ts の skipDisabledErrors
export const contentFormSchema = z.object({
  url: z.string(),
  content: contentSchema,
  attributes: attributesSchema,
});

export type ContentFormValues = z.infer<typeof contentFormSchema>;
export type Content = z.infer<typeof contentSchema>;
export type Section = z.infer<typeof sectionSchema>;
export type Attributes = z.infer<typeof attributesSchema>;
