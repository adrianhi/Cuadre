import { isTransferMovement, type MovementClassification } from './transaction-policy';

const ignoredTokens = new Set([
  'sr', 'sra', 'srta', 'lic', 'ing', 'dr', 'dra', 'de', 'del', 'la', 'las', 'los', 'y',
]);

export function normalizedNameTokens(value: string): string[] {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length >= 2 && !ignoredTokens.has(token));
}

export function matchesWorkspaceOwner(candidate: string, ownerNames: string[]): boolean {
  const candidateTokens = new Set(normalizedNameTokens(candidate));
  if (candidateTokens.size < 2) return false;
  return ownerNames.some((name) => {
    const ownerTokens = [...new Set(normalizedNameTokens(name))];
    return ownerTokens.length >= 2 && ownerTokens.filter((token) => candidateTokens.has(token)).length >= 2;
  });
}

export function isPotentialSelfTransfer(
  movement: MovementClassification & { merchant?: string | null; rawMerchant?: string | null },
  ownerNames: string[],
): boolean {
  if (!isTransferMovement(movement)) return false;
  return matchesWorkspaceOwner(`${movement.merchant || ''} ${movement.rawMerchant || ''}`, ownerNames);
}
