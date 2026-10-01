import type { Control, FieldPath, FieldValues } from 'react-hook-form';

/** 以用户输入的方式写入指定字段（dirty / touched / 重新校验 都按正常输入处理） */
export function writeField<T extends FieldValues>(control: Control<T>, name: FieldPath<T>, value: unknown) {
  void control.register(name).onChange({ target: { name, value }, type: 'change' });
}
