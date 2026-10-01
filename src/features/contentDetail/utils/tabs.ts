import type { FieldErrors } from 'react-hook-form';
import type { ContentFormValues } from './schema';

export type MainTab = 'content' | 'attributes' | 'category' | 'history';

export const MAIN_TABS: { value: MainTab; label: string }[] = [
  { value: 'content', label: 'コンテンツ' },
  { value: 'attributes', label: '属性' },
  { value: 'category', label: 'カテゴリー' },
  { value: 'history', label: '更新履歴' },
];

export type ErrorLocation = { tab: MainTab; section?: number };

/** 検証エラーから、表示すべきタブ / section を特定する */
export function locateFirstError(errors: FieldErrors<ContentFormValues>): ErrorLocation | undefined {
  if (errors.content) {
    const sections = errors.content.sections;
    const section = Array.isArray(sections) ? sections.findIndex(Boolean) : -1;
    return { tab: 'content', section: section >= 0 ? section : undefined };
  }
  if (errors.attributes) return { tab: 'attributes' };
  return undefined;
}
