import type { Section } from './schema';

/** index 番目の section の項目のパスを作る。例：content.sections.0.summary */
export const sectionField = <K extends keyof Section>(index: number, key: K) =>
  `content.sections.${index}.${key}` as const;
