import type { LucideIcon } from 'lucide-react';
import { Home, ReceiptText, SlidersHorizontal, Sparkles } from 'lucide-react';

export type AppSection = 'home' | 'transactions' | 'control' | 'hub';

export interface AppSectionConfig {
  id: AppSection;
  label: string;
  path: string;
  icon: LucideIcon;
}

export const APP_SECTIONS: readonly AppSectionConfig[] = [
  { id: 'home', label: 'Inicio', path: '/app/home', icon: Home },
  { id: 'transactions', label: 'Movimientos', path: '/app/transactions', icon: ReceiptText },
  { id: 'control', label: 'Control', path: '/app/control', icon: SlidersHorizontal },
  { id: 'hub', label: 'Hub', path: '/app/hub', icon: Sparkles },
] as const;
