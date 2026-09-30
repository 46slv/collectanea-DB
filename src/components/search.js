export function normalizeText(value) {
  return (value ?? '').toString().toLocaleLowerCase('ja').normalize('NFKC');
}

export function tokenizeQuery(query) {
  return normalizeText(query)
    .split(/[\s\u3000、。,.，．/\\|]+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 0);
}

// Tokenized substring match for Japanese/Latin mixed queries. Every query
// token must appear somewhere in the haystack. Single-character CJK tokens
// match as substrings as well (no word-boundary assumption for Japanese).
export function matchesEntry(entry, query) {
  const tokens = tokenizeQuery(query);
  if (!tokens.length) return true;
  const haystack = normalizeText(
    [entry.title, entry.summary, entry.hierarchy, ...(entry.tags ?? []), entry.type, entry.domain]
      .filter(Boolean)
      .join(' '),
  );
  return tokens.every((token) => haystack.includes(token));
}
