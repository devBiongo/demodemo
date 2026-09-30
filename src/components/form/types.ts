import type { ReactNode } from 'react';

export type Option<V extends string = string> = {
  value: V;
  label: ReactNode;
  help?: ReactNode;
};
