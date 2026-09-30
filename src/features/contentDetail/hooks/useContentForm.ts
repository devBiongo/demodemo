import { useFormContext } from 'react-hook-form';
import type { ContentFormValues } from '../utils/schema';

/** 带类型的 useFormContext，子组件统一从这里取 */
export const useContentForm = () => useFormContext<ContentFormValues>();
