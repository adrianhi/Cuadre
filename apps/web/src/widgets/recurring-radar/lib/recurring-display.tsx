import { Building2, Dumbbell, Repeat, Tv, Wifi, Zap } from "lucide-react";

export const CADENCE_LABELS = {
  BIWEEKLY: "Quincenal",
  MONTHLY: "Mensual",
  ANNUAL: "Anual",
} as const;

export function getServiceIcon(name: string) {
  const lower = name.toLowerCase();
  if (
    lower.includes("claro") ||
    lower.includes("altice") ||
    lower.includes("viva") ||
    lower.includes("internet") ||
    lower.includes("wifi")
  ) {
    return <Wifi className="h-5 w-5 text-sky-500" />;
  }
  if (
    lower.includes("luz") ||
    lower.includes("edeeste") ||
    lower.includes("edesur") ||
    lower.includes("edenorte") ||
    lower.includes("electric") ||
    lower.includes("energia")
  ) {
    return <Zap className="h-5 w-5 text-amber-500" />;
  }
  if (
    lower.includes("netflix") ||
    lower.includes("spotify") ||
    lower.includes("youtube") ||
    lower.includes("apple") ||
    lower.includes("prime") ||
    lower.includes("streaming") ||
    lower.includes("disney")
  ) {
    return <Tv className="h-5 w-5 text-purple-500" />;
  }
  if (
    lower.includes("smart fit") ||
    lower.includes("gym") ||
    lower.includes("gimnasio") ||
    lower.includes("fitness") ||
    lower.includes("gold")
  ) {
    return <Dumbbell className="h-5 w-5 text-orange-500" />;
  }
  if (
    lower.includes("alquiler") ||
    lower.includes("mantenimiento") ||
    lower.includes("condominio") ||
    lower.includes("apartamento") ||
    lower.includes("casa")
  ) {
    return <Building2 className="h-5 w-5 text-emerald-500" />;
  }
  return <Repeat className="h-5 w-5 text-primary" />;
}
