const explicitInternalTransferPattern = /(?:entre\s+(?:mis|sus)\s+(?:cuentas|productos)|(?:cuenta|producto)\s+prop(?:ia|io)|productos?\s+propios?|mismo\s+titular)/i;

export function hasExplicitInternalTransferSignal(...values: Array<string | null | undefined>): boolean {
  return explicitInternalTransferPattern.test(values.filter(Boolean).join(' '));
}
