import { useEffect, useMemo, useRef, useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import {
  clearEntries,
  createIsDisabled,
  evaluate,
  sameOps,
  type FieldRules,
  type IsDisabled,
} from '../models/fieldControl';
import type { PageMode } from '../models/page';
import type { ContentFormValues } from '../models/schema';

type Options = {
  /** rules の selectSection が呼ばれたとき */
  onSelectSection: (index: number) => void;
};

/**
 * rules（fieldRules.ts）を入力値が変わるたびに実行し、各項目の活性状態を返す。
 * 実行自体は watch のコールバック内なので再レンダリングしない。
 * 結果（活性状態）が変わったときだけ state を更新する。
 */
export function useFieldControl(
  { watch, getValues, setValue }: UseFormReturn<ContentFormValues>,
  mode: PageMode,
  rules: FieldRules,
  options: Options,
): IsDisabled {
  const rulesRef = useRef(rules);
  rulesRef.current = rules;
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const [ops, setOps] = useState(() => evaluate(rules, { values: getValues(), mode }).ops);

  useEffect(() => {
    /** clear による setValue で、自分自身が再度呼ばれるのを防ぐ */
    let applying = false;

    const update = (changed?: string) => {
      let { ops: next, clearOps, section } = evaluate(rulesRef.current, { values: getValues(), mode, changed });
      if (section !== undefined) optionsRef.current.onSelectSection(section);
      const entries = clearEntries(clearOps, (path) => getValues(path));
      if (entries.length) {
        applying = true;
        for (const [path, value] of entries) setValue(path, value as never, { shouldDirty: true });
        applying = false;
        // クリアした値で改めて判定する
        next = evaluate(rulesRef.current, { values: getValues(), mode }).ops;
      }
      setOps((prev) => (sameOps(prev, next) ? prev : next));
    };

    const { unsubscribe } = watch((_, { name }) => {
      if (!applying) update(name);
    });
    return unsubscribe;
  }, [watch, getValues, setValue, mode]);

  return useMemo(() => createIsDisabled(ops), [ops]);
}
