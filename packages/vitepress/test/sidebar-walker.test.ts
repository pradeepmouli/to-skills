import { describe, it, expect } from 'vitest';
import { walkSidebar } from '../src/sidebar-walker.js';

describe('walkSidebar', () => {
  it('extracts ordered docs from flat items', () => {
    const sidebar = [
      { text: 'Introduction', link: '/guide/intro' },
      { text: 'Installation', link: '/guide/installation' },
      { text: 'Configuration', link: '/guide/config' }
    ];

    const docs = walkSidebar(sidebar);

    expect(docs).toHaveLength(3);
    expect(docs[0]).toEqual({ title: 'Introduction', path: '/guide/intro', order: 0 });
    expect(docs[1]).toEqual({ title: 'Installation', path: '/guide/installation', order: 1 });
    expect(docs[2]).toEqual({ title: 'Configuration', path: '/guide/config', order: 2 });
  });

  it('handles nested groups (items within items)', () => {
    const sidebar = [
      {
        text: 'Guide',
        items: [
          { text: 'Getting Started', link: '/guide/start' },
          { text: 'Advanced', link: '/guide/advanced' }
        ]
      }
    ];

    const docs = walkSidebar(sidebar);

    expect(docs).toHaveLength(2);
    expect(docs[0]).toEqual({ title: 'Getting Started', path: '/guide/start', order: 0 });
    expect(docs[1]).toEqual({ title: 'Advanced', path: '/guide/advanced', order: 1 });
  });

  it('skips items without link (group headings)', () => {
    const sidebar = [{ text: 'Group Heading' }, { text: 'Real Doc', link: '/real' }];

    const docs = walkSidebar(sidebar);

    expect(docs).toHaveLength(1);
    expect(docs[0]!.path).toBe('/real');
  });

  it('uses text as title', () => {
    const sidebar = [{ text: 'My Custom Title', link: '/some/path' }];

    const docs = walkSidebar(sidebar);

    expect(docs[0]!.title).toBe('My Custom Title');
  });

  it('falls back to path-derived title when text missing', () => {
    const sidebar = [{ link: '/guide/getting-started' }];

    const docs = walkSidebar(sidebar);

    expect(docs[0]!.title).toBe('Getting Started');
  });

  it('returns empty array for empty sidebar array', () => {
    expect(walkSidebar([])).toEqual([]);
  });

  it('returns empty array for empty sidebar object', () => {
    expect(walkSidebar({})).toEqual([]);
  });

  it('merges multiple route sidebars (object form)', () => {
    const sidebar = {
      '/guide/': [
        { text: 'Intro', link: '/guide/intro' },
        { text: 'Install', link: '/guide/install' }
      ],
      '/api/': [{ text: 'Reference', link: '/api/reference' }]
    };

    const docs = walkSidebar(sidebar);

    expect(docs).toHaveLength(3);
    expect(docs[0]!.path).toBe('/guide/intro');
    expect(docs[1]!.path).toBe('/guide/install');
    expect(docs[2]!.path).toBe('/api/reference');
    // orders must be sequential
    expect(docs.map((d) => d.order)).toEqual([0, 1, 2]);
  });

  it('excludes routes matching exclude patterns', () => {
    const sidebar = {
      '/guide/': [{ text: 'Intro', link: '/guide/intro' }],
      '/api/': [{ text: 'Reference', link: '/api/reference' }]
    };

    const docs = walkSidebar(sidebar, { exclude: ['/api/'] });

    expect(docs).toHaveLength(1);
    expect(docs[0]!.path).toBe('/guide/intro');
  });

  it('handles top-level items with link (no group wrapper)', () => {
    const sidebar = [
      { text: 'Home', link: '/' },
      {
        text: 'Group',
        items: [{ text: 'Child', link: '/child' }]
      },
      { text: 'Standalone', link: '/standalone' }
    ];

    const docs = walkSidebar(sidebar);

    expect(docs).toHaveLength(3);
    expect(docs[0]).toEqual({ title: 'Home', path: '/', order: 0 });
    expect(docs[1]).toEqual({ title: 'Child', path: '/child', order: 1 });
    expect(docs[2]).toEqual({ title: 'Standalone', path: '/standalone', order: 2 });
  });

  it('recurses into nested items of group headings without link', () => {
    const sidebar = [
      {
        text: 'Section',
        items: [
          {
            text: 'Sub-section',
            items: [{ text: 'Deep Doc', link: '/deep/doc' }]
          }
        ]
      }
    ];

    const docs = walkSidebar(sidebar);

    expect(docs).toHaveLength(1);
    expect(docs[0]).toEqual({ title: 'Deep Doc', path: '/deep/doc', order: 0 });
  });
});
