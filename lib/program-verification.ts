import { programs } from './program-catalog.ts';

const verifiedIds = new Set(programs.map(program => program.id));

export function isVerifiedProgram(legacyId?: string): boolean {
  return Boolean(legacyId && verifiedIds.has(legacyId));
}
