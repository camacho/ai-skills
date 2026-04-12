#!/usr/bin/env tsx
// Usage:
//   tsx lib/cli.ts canonicalize <file>
//   tsx lib/cli.ts verify <frozen> <candidate>
//
// Exit codes:
//   0 — MATCH (verify) / SUCCESS (canonicalize)
//   1 — DRIFT (verify only)
//   2 — input error (missing file, bad args, NoAlgebraBlockError)
//   3 — internal error
import { readFileSync } from 'node:fs';
import { canonicalize } from './canonicalize.js';
import { NoAlgebraBlockError, verify } from './verify.js';

const [, , subcommand, ...args] = process.argv;

try {
  if (subcommand === 'canonicalize') {
    if (args.length !== 1) {
      process.stderr.write('usage: canonicalize <file>\n');
      process.exit(2);
    }
    // args.length === 1 is verified above; cast to narrow the type.
    const [filePath] = args as [string];
    const text = readFileSync(filePath, 'utf8');
    process.stdout.write(canonicalize(text));
    process.exit(0);
  }

  if (subcommand === 'verify') {
    if (args.length !== 2) {
      process.stderr.write('usage: verify <frozen> <candidate>\n');
      process.exit(2);
    }
    // args.length === 2 is verified above; cast to narrow the type.
    const [frozenPath, candidatePath] = args as [string, string];
    const frozen = readFileSync(frozenPath, 'utf8');
    const candidate = readFileSync(candidatePath, 'utf8');
    const result = verify(frozen, candidate);
    if (result.match) {
      process.stdout.write('MATCH\n');
      process.exit(0);
    }
    process.stdout.write(`DRIFT\n${result.diff}\n`);
    process.exit(1);
  }

  process.stderr.write(`unknown subcommand: ${subcommand ?? '(none)'}\n`);
  process.exit(2);
} catch (err) {
  // Type-safe error branches — prefer instanceof over string name matching.
  if (err instanceof NoAlgebraBlockError) {
    process.stderr.write(`${err.message}\n`);
    process.exit(2);
  }
  const e = err as NodeJS.ErrnoException;
  if (e && e.code === 'ENOENT') {
    process.stderr.write(`file not found: ${e.message}\n`);
    process.exit(2);
  }
  process.stderr.write(`internal error: ${(err as Error).stack}\n`);
  process.exit(3);
}
