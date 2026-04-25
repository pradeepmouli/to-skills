// Internal pagination helper shared by tools/resources/prompts list helpers.
//
// The MCP spec uses opaque-string cursors with the convention that an
// undefined `nextCursor` signals end-of-stream. Some servers (and some SDK
// versions) instead emit `nextCursor: ''` for the last page; we treat that
// as a terminator too so we never spin forever on a falsy-but-defined value.
//
// Each list endpoint shapes its page differently (`{ tools }`, `{ resources }`,
// `{ prompts }`), so callers adapt to a uniform `{ items, nextCursor }` at the
// fetch boundary. Defensive `?? []` on `items` here means a malformed page
// (missing array key) yields an empty page rather than a TypeError on spread.
//
// Not exported from the package's public surface — keep it internal.

export async function paginate<TItem>(
  fetchPage: (cursor?: string) => Promise<{ items: TItem[] | undefined; nextCursor?: string }>
): Promise<TItem[]> {
  const all: TItem[] = [];
  let cursor: string | undefined;
  do {
    const page = await fetchPage(cursor);
    all.push(...(page.items ?? []));
    // Treat empty-string cursor as terminator (per MCP server-implementation variance).
    cursor = page.nextCursor || undefined;
  } while (cursor !== undefined);
  return all;
}
