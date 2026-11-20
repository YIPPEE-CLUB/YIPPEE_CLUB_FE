import { describe, expect, it, vi, afterEach } from 'vitest';
vi.mock('../lib/api', () => ({ apiRequest: vi.fn() }));
vi.mock('../lib/preview-session', () => ({ readPreviewSession: () => null }));
import { apiRequest } from '../lib/api';
import {
  listActivities,
  getActivity,
  toActivity,
  type ActivityResponse,
} from './activities';
import { filterActivities, defaultFilters } from '../components/CatalogFilters';
const row: ActivityResponse = {
  id: 42,
  title: '테스트 활동지',
  description: '실제 설명',
  price: 0,
  age_min_months: 30,
  age_max_months: 59,
  duration_min: 5,
  duration_max: 20,
  difficulty: 'hard',
  categories: [7, 12],
  image: '/image',
  pdf: '/pdf',
};
const categories = [
  { id: 7, name: '미술' },
  { id: 12, name: '탐구' },
];
afterEach(() => vi.resetAllMocks());
describe('backend activity contract', () => {
  it('preserves IDs, ranges, difficulty and file URLs and resolves every category', () => {
    expect(toActivity(row, categories)).toMatchObject({
      id: 42,
      ageYears: 2,
      ageMaxMonths: 59,
      durationMin: 5,
      durationMax: 20,
      difficulty: 'hard',
      categoryIds: [7, 12],
      categoryNames: ['미술', '탐구'],
      thumbnail: '/image',
      pdf: '/pdf',
      description: '실제 설명',
    });
  });
  it('filters overlapping ages and durations and secondary categories', () => {
    expect(
      filterActivities(
        [toActivity(row, categories)],
        { ...defaultFilters, age: '4', duration: '5-10' },
        '',
        '탐구',
      ),
    ).toHaveLength(1);
    expect(
      filterActivities([toActivity(row, categories)], {
        ...defaultFilters,
        age: '5',
      }),
    ).toHaveLength(0);
  });
  it('rejects malformed server data instead of inventing defaults', () => {
    expect(() =>
      toActivity(
        { ...row, age_min_months: undefined } as unknown as ActivityResponse,
        categories,
      ),
    ).toThrow();
  });
  it('loads all pages and category names', async () => {
    vi.mocked(apiRequest)
      .mockResolvedValueOnce({ results: categories })
      .mockResolvedValueOnce({
        results: [row],
        next: 'http://backend/activities?page=2',
      })
      .mockResolvedValueOnce({ results: [{ ...row, id: 43 }], next: null });
    const items = await listActivities(new AbortController().signal);
    expect(items.map((i) => i.id)).toEqual([42, 43]);
    expect(apiRequest).toHaveBeenLastCalledWith(
      '/activities?page_size=100&page=2',
      expect.anything(),
    );
  });
  it('loads detail directly without depending on the catalogue', async () => {
    vi.mocked(apiRequest)
      .mockResolvedValueOnce(row)
      .mockResolvedValueOnce({ results: categories });
    expect((await getActivity(42)).categoryNames).toEqual(['미술', '탐구']);
    expect(apiRequest).toHaveBeenCalledWith(
      '/activities/42',
      expect.anything(),
    );
  });
});
