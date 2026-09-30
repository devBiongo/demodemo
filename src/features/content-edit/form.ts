import { useFormContext, type FieldErrors } from 'react-hook-form';
import type { ContentFormValues, Section } from './schema';

export type MainTab = 'content' | 'attributes' | 'category' | 'history';

/** 带类型的 useFormContext，子组件统一从这里取 */
export const useContentForm = () => useFormContext<ContentFormValues>();

/** 生成第 index 个 section 某字段的路径，如 content.sections.0.summary */
export const sectionField = <K extends keyof Section>(index: number, key: K) =>
  `content.sections.${index}.${key}` as const;

/** 根据校验错误定位到应当显示的 tab / section */
export function locateFirstError(
  errors: FieldErrors<ContentFormValues>,
): { tab: MainTab; section?: number } | undefined {
  if (errors.content) {
    const sections = errors.content.sections;
    const section = Array.isArray(sections) ? sections.findIndex(Boolean) : -1;
    return { tab: 'content', section: section >= 0 ? section : undefined };
  }
  if (errors.attributes) return { tab: 'attributes' };
  return undefined;
}
