export interface OrderedDoc {
  title: string;
  path: string;
  order: number;
}

export interface WalkSidebarOptions {
  exclude?: string[];
}

interface SidebarItem {
  text?: string;
  link?: string;
  items?: SidebarItem[];
  collapsed?: boolean;
}

type Sidebar = SidebarItem[] | Record<string, SidebarItem[]>;

function linkToTitle(link: string): string {
  const segment = link.split('/').filter(Boolean).pop() ?? link;
  return segment.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function walkItems(items: SidebarItem[], results: OrderedDoc[], counter: { value: number }): void {
  for (const item of items) {
    if (item.link) {
      results.push({
        title: item.text ?? linkToTitle(item.link),
        path: item.link,
        order: counter.value++
      });
    }
    if (item.items) {
      walkItems(item.items, results, counter);
    }
  }
}

export function walkSidebar(sidebar: Sidebar, options?: WalkSidebarOptions): OrderedDoc[] {
  const results: OrderedDoc[] = [];
  const counter = { value: 0 };
  const exclude = options?.exclude ?? [];

  if (Array.isArray(sidebar)) {
    walkItems(sidebar, results, counter);
  } else {
    for (const [route, items] of Object.entries(sidebar)) {
      if (exclude.some((prefix) => route.startsWith(prefix))) {
        continue;
      }
      walkItems(items, results, counter);
    }
  }

  return results;
}
