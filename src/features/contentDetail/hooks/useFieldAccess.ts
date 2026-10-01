import { useContentDetailContext } from './useContentForm';

/** 項目が非活性か。判定は fieldRules.ts による */
export const useFieldAccess = () => ({ isDisabled: useContentDetailContext().isDisabled });
