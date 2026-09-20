export { CuadreDelMesModal } from './ui/CuadreDelMesModal';
export type { CuadreDelMesModalProps } from './ui/CuadreDelMesModal';
export { CuadreDelMesCard } from './ui/CuadreDelMesCard';
export { CuadreDelMesBanner } from './ui/CuadreDelMesBanner';

export {
  FINANCIAL_ARCHETYPES,
  type FinancialArchetype,
  type ArchetypeId,
} from './model/archetypes';

export {
  calculateCuadreDelMes,
  formatWhatsAppSummary,
  type CuadreDelMesData,
  type CuadreMerchant,
  type CuadreCategory,
} from './model/wrapped-calculator';

export {
  generateWrappedCanvas,
  downloadWrappedImage,
  shareWrappedImage,
} from './model/wrapped-canvas';

export {
  useCuadreDelMes,
  getDefaultWrappedMonth,
  getRecentMonths,
  type UseCuadreDelMesOptions,
  type UseCuadreDelMesResult,
} from './model/useCuadreDelMes';
