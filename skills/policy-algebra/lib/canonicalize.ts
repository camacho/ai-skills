// Versioned: bump CANONICALIZE_VERSION if the normalization rules change.
// Frozen files compared across versions should surface a version mismatch
// warning rather than a silent semantic shift.
export const CANONICALIZE_VERSION = 1 as const;

export function canonicalize(text: string): string {
  if (text === '') return '';
  // 1. Strip UTF-8 BOM
  let result = text.startsWith('\uFEFF') ? text.slice(1) : text;
  // 2. Normalize line endings: \r\n -> \n, lone \r -> \n
  result = result.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  // 3. Strip trailing whitespace at end-of-line only (preserve inline spacing)
  result = result
    .split('\n')
    .map((line) => line.replace(/[ \t]+$/, ''))
    .join('\n');
  // 4. Collapse runs of 3+ consecutive newlines (2+ blank lines) to exactly 2
  //    newlines (1 blank line between content lines).
  result = result.replace(/\n{3,}/g, '\n\n');
  // 5. Strip leading and trailing blank lines
  result = result.replace(/^\n+/, '').replace(/\n+$/, '');
  // 6. Re-add single trailing newline if there is content
  return result === '' ? '' : result + '\n';
}
