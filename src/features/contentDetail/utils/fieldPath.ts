import type { Section } from './schema';

/** 生成第 index 个 section 某字段的路径，如 content.sections.0.summary */
export const sectionField = <K extends keyof Section>(index: number, key: K) =>
  `content.sections.${index}.${key}` as const;
