import { canonicalize } from './canonicalize.js';
import { unifiedDiff } from './diff.js';

export class NoAlgebraBlockError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NoAlgebraBlockError';
  }
}

export interface VerifyResult {
  match: boolean;
  diff: string | null;
}

// Allow \r\n or \n — extractAlgebra runs before canonicalize, so CRLF files must match.
const STARLARK_FENCE = /```starlark\r?\n([\s\S]*?)\r?\n```/;

export function extractAlgebra(text: string): string {
  const match = text.match(STARLARK_FENCE);
  if (!match) {
    throw new NoAlgebraBlockError('no ```starlark fenced block found');
  }
  // match[1] is always defined when STARLARK_FENCE matches — the regex has one capture group
  return match[1] as string;
}

export function verify(frozen: string, candidate: string): VerifyResult {
  const fc = canonicalize(extractAlgebra(frozen));
  const cc = canonicalize(extractAlgebra(candidate));
  if (fc === cc) {
    return { match: true, diff: null };
  }
  return { match: false, diff: unifiedDiff(fc, cc) };
}
