import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { ActivityCatalog } from './ActivityCatalog';
import { sampleActivities } from '../data/activities';
import { recommendActivities } from '../lib/recommendations';

describe('catalog UI', () => {
  it('renders at most 20 distinct cards and exposes the next page', () => {
    const items = Array.from({ length: 45 }, (_, i) => ({
      ...sampleActivities[0],
      id: i + 1,
      title: `활동안 ${i + 1}`,
    }));
    const html = renderToStaticMarkup(
      createElement(
        MemoryRouter,
        null,
        createElement(ActivityCatalog, {
          activities: items,
          savedIds: [],
          onToggle: () => {},
        }),
      ),
    );
    expect((html.match(/<article/g) || []).length).toBe(20);
    expect(html).toContain('1 / 3');
    expect(html).toContain('활동안 20 선택');
    expect(html).not.toContain('활동안 21 선택');
    expect(html).toContain('원클릭 맞춤형 놀이 찾기');
    expect(html).toContain('실시간 인기 검색어');
  });
  it('keeps category/search results within the same page limit', () => {
    const html = renderToStaticMarkup(
      createElement(
        MemoryRouter,
        { initialEntries: ['/activities?q=공룡'] },
        createElement(ActivityCatalog, {
          activities: sampleActivities,
          savedIds: [],
          onToggle: () => {},
        }),
      ),
    );
    expect((html.match(/<article/g) || []).length).toBe(1);
    expect(html).toContain('종이로 만드는 공룡 친구 선택');
  });
});
describe('personalized results', () => {
  it('matches age range and ranks shared integer category IDs first', () => {
    const base = { ...sampleActivities[0], ageMinMonths: 24, ageMaxMonths: 48 };
    const results = recommendActivities(
      [
        { ...base, id: 1, categoryIds: [4] },
        { ...base, id: 2, categoryIds: [7] },
        { ...base, id: 3, ageMinMonths: 60 },
      ],
      { birth_date: '2023-11-16', interests: [7] },
      new Date('2026-11-16T12:00:00'),
    );
    expect(results.map((i) => i.id)).toEqual([2, 1]);
  });
});
