import { useEffect, useMemo, useRef, useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import {
  clearEntries,
  createIsDisabled,
  evaluate,
  sameOps,
  type FieldController,
  type IsDisabled,
} from '../utils/fieldControl';
import type { PageMode } from '../utils/pageMode';
import type { ContentFormValues } from '../utils/schema';

/**
 * controller を入力値が変わるたびに実行し、各項目の活性状態を返す。
 * 実行自体は watch のコールバック内なので再レンダリングしない。
 * 結果（活性状態）が変わったときだけ state を更新する。
 */
export function useFieldControl(
  { watch, getValues, setValue }: UseFormReturn<ContentFormValues>,
  mode: PageMode,
  controller: FieldController,
): IsDisabled {
  const controllerRef = useRef(controller);
  controllerRef.current = controller;

  const [ops, setOps] = useState(() => evaluate(controller, { values: getValues(), mode }).ops);

  useEffect(() => {
    /** clearDisabled による setValue で、自分自身が再度呼ばれるのを防ぐ */
    let applying = false;

    const update = (changed?: string) => {
      let { ops: next, clears } = evaluate(controllerRef.current, { values: getValues(), mode, changed });
      if (clears.length) {
        applying = true;
        for (const [target, opCount] of clears) {
          const isDisabled = createIsDisabled(next.slice(0, opCount));
          for (const [path, value] of clearEntries(target, getValues(target), isDisabled)) {
            setValue(path, value as never, { shouldDirty: true });
          }
        }
        applying = false;
        // クリアした値で改めて判定する
        next = evaluate(controllerRef.current, { values: getValues(), mode }).ops;
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
