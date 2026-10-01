import type { Control, FieldPath, FieldValues } from 'react-hook-form';

/** ユーザー入力と同じ方法で指定の項目に書き込む（dirty / touched / 再検証 もすべて通常の入力として扱う） */
export function writeField<T extends FieldValues>(control: Control<T>, name: FieldPath<T>, value: unknown) {
  void control.register(name).onChange({ target: { name, value }, type: 'change' });
}
