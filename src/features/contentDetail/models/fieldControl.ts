import type { FieldErrors, FieldPath, Resolver } from 'react-hook-form';
import type { PageMode } from './page';
import type { ContentFormValues } from './schema';

/** 入力項目以外のボタン */
export type ActionKey =
  // ヘッダー
  | 'action.submit'
  | 'action.draft'
  | 'action.cancel'
  // タイトル
  | 'action.preview'
  // 本文エディタ
  | 'action.fullscreen'
  | 'action.switchMode'
  | 'action.compare'
  | 'action.fileInsert'
  // 比較ダイアログ
  | 'action.compareClose'
  // 属性
  | 'action.relatedEdit';
type FormPath = FieldPath<ContentFormValues>;
/** 指定対象：フォームのパス（'content' のように親を指定すると配下すべて）またはボタン */
export type FieldTarget = FormPath | ActionKey;

export type FieldControlContext = {
  /** フォーム全体の現在値 */
  values: ContentFormValues;
  mode: PageMode;
  /** 今回変更された項目（初回・reset 時は undefined） */
  changed?: string;
};

export type FieldControlApi = {
  disable: (...targets: FieldTarget[]) => void;
  enable: (...targets: FieldTarget[]) => void;
  /** すべて非活性 */
  disableAll: () => void;
  /**
   * 値を空にする（活性 / 非活性とは無関係）。親を指定すると配下すべて。
   * ユーザーの操作に応じて実行される（送信時の検証では実行しない）。
   * 毎回の入力で呼ばれるため、通常は changed で条件を付ける
   */
  clear: (...targets: FormPath[]) => void;
  /** clear の対象から外す（後から指定したものが優先） */
  keep: (...targets: FormPath[]) => void;
  /**
   * コンテンツ画面のタブ（section）を選択する。0 始まり。
   * clear と同じくユーザーの操作に応じて実行されるため、通常は changed で条件を付ける
   * （付けないと入力のたびにこのタブに戻り、ユーザーがタブを切り替えられない）
   */
  selectSection: (index: number) => void;
};

/** 画面項目の活性 / 非活性・値のクリアを決める関数 */
export type FieldRules = (ctx: FieldControlContext, field: FieldControlApi) => void;

export type IsDisabled = (target: FieldTarget) => boolean;

/** [対象, true/false]。'' はすべて */
type Op = readonly [string, boolean];

export type Evaluation = {
  /** disable(true) / enable(false) */
  ops: Op[];
  /** clear(true) / keep(false) */
  clearOps: Op[];
  /** selectSection で指定された section（複数回呼んだ場合は最後のもの） */
  section?: number;
};

export function evaluate(rules: FieldRules, ctx: FieldControlContext): Evaluation {
  const ops: Op[] = [];
  const clearOps: Op[] = [];
  let section: number | undefined;
  rules(ctx, {
    disable: (...targets) => targets.forEach((t) => ops.push([t, true])),
    enable: (...targets) => targets.forEach((t) => ops.push([t, false])),
    disableAll: () => ops.push(['', true]),
    clear: (...targets) => targets.forEach((t) => clearOps.push([t, true])),
    keep: (...targets) => targets.forEach((t) => clearOps.push([t, false])),
    selectSection: (index) => {
      section = index;
    },
  });
  return { ops, clearOps, section };
}

/** 対象に当てはまる指定のうち、最後のものを返す（親の指定は配下にも当てはまる）。指定なしは false */
const createMatcher =
  (ops: readonly Op[]) =>
  (target: string): boolean => {
    let result = false;
    for (const [prefix, value] of ops) {
      if (prefix === '' || target === prefix || target.startsWith(`${prefix}.`)) result = value;
    }
    return result;
  };

/** 後から指定したものが優先。どこにも指定されていない項目は活性 */
export const createIsDisabled = (ops: readonly Op[]): IsDisabled => createMatcher(ops);

export const sameOps = (a: readonly Op[], b: readonly Op[]) =>
  a.length === b.length && a.every(([p, d], i) => p === b[i][0] && d === b[i][1]);

/** 型に応じた空の値。プリミティブの配列（チェックボックス群など）は 1 項目として扱う */
const emptyOf = (value: unknown) =>
  typeof value === 'string' ? '' : typeof value === 'boolean' ? false : Array.isArray(value) ? [] : undefined;

/** value（path の値）の配下で、shouldClear の項目を空の値にした [パス, 値] を列挙（既に空のものは除く） */
function emptyEntries(path: string, value: unknown, shouldClear: (path: string) => boolean): [FormPath, unknown][] {
  const isLeaf = typeof value !== 'object' || value === null || (Array.isArray(value) && value.every((v) => typeof v !== 'object'));
  if (isLeaf) {
    const empty = emptyOf(value);
    const changed = Array.isArray(value) ? value.length > 0 : value !== empty;
    return empty !== undefined && changed && shouldClear(path) ? [[path as FormPath, empty]] : [];
  }
  return Object.entries(value).flatMap(([k, v]) => emptyEntries(`${path}.${k}`, v, shouldClear));
}

/** clear / keep の指定から、クリアする [パス, 空の値] を列挙 */
export function clearEntries(clearOps: readonly Op[], getValue: (path: FormPath) => unknown): [FormPath, unknown][] {
  const shouldClear = createMatcher(clearOps);
  const entries = new Map<FormPath, unknown>();
  for (const [root, clear] of clearOps) {
    if (!clear) continue;
    for (const [path, value] of emptyEntries(root, getValue(root as FormPath), shouldClear)) entries.set(path, value);
  }
  return [...entries];
}

/** 非活性の項目のエラーを取り除く（非活性の項目はユーザーが直せないため、検証しない） */
function pruneErrors(errors: Record<string, unknown>, isDisabled: IsDisabled, base = ''): Record<string, unknown> {
  const result = (Array.isArray(errors) ? [] : {}) as Record<string, unknown>;
  for (const [key, error] of Object.entries(errors)) {
    if (!error) continue;
    const path = base ? `${base}.${key}` : key;
    if (isDisabled(path as FieldTarget)) continue;
    if (typeof error === 'object' && 'type' in error && 'message' in error) {
      result[key] = error;
      continue;
    }
    const child = pruneErrors(error as Record<string, unknown>, isDisabled, path);
    if (Object.keys(child).length) result[key] = child;
  }
  return result;
}

/** resolver をラップし、非活性の項目のエラーを除外する */
export const skipDisabledErrors =
  (resolver: Resolver<ContentFormValues>, getIsDisabled: (values: ContentFormValues) => IsDisabled): Resolver<ContentFormValues> =>
  async (values, context, options) => {
    const result = await resolver(values, context, options);
    if (!Object.keys(result.errors).length) return result;
    const errors = pruneErrors(result.errors, getIsDisabled(values)) as FieldErrors<ContentFormValues>;
    return Object.keys(errors).length ? { values: {}, errors } : { values, errors: {} };
  };
