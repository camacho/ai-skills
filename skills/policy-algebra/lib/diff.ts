// Minimal line-based diff. Inputs are canonicalized so true LCS is unnecessary;
// we just show lines that differ with -/+ markers aligned by index.
//
// Important: canonicalize() always terminates non-empty output with \n, so
// inputs to this function end with \n. `'a\nb\n'.split('\n')` yields
// `['a','b','']` — a trailing empty element. If left in, it would pair a
// real line in the longer input against an empty string in the shorter one,
// producing spurious `- ` / `+ ` markers. We pop the trailing empty element
// from both arrays before iterating.
export function unifiedDiff(a: string, b: string): string {
  const aLines = a.split('\n');
  const bLines = b.split('\n');
  if (aLines.length > 0 && aLines[aLines.length - 1] === '') aLines.pop();
  if (bLines.length > 0 && bLines[bLines.length - 1] === '') bLines.pop();
  const maxLen = Math.max(aLines.length, bLines.length);
  const out: string[] = ['--- frozen', '+++ candidate'];
  for (let i = 0; i < maxLen; i++) {
    const aLine = aLines[i];
    const bLine = bLines[i];
    if (aLine === bLine) {
      if (aLine !== undefined) out.push(`  ${aLine}`);
    } else {
      if (aLine !== undefined) out.push(`- ${aLine}`);
      if (bLine !== undefined) out.push(`+ ${bLine}`);
    }
  }
  return out.join('\n');
}
