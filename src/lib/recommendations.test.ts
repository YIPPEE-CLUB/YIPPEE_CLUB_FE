import { expect, it } from 'vitest';
import { filterRecommendations } from './recommendations';
import { sampleActivities } from '../data/activities';
const filters = {
  name: '아이',
  age: '3',
  materials: ['색연필'],
  categories: ['그림/색칠'],
  domains: ['예술경험'],
};
it('applies selected age, materials, category and development domain together', () => {
  const item = {
    ...sampleActivities[0],
    ageYears: 3,
    category: '그림/색칠',
    materials: ['색연필'],
    developmentDomains: ['예술경험'],
  };
  expect(filterRecommendations([item], filters)).toHaveLength(1);
  expect(
    filterRecommendations([{ ...item, ageYears: 5 }], filters),
  ).toHaveLength(0);
  expect(
    filterRecommendations([{ ...item, materials: ['가위'] }], filters),
  ).toHaveLength(0);
  expect(
    filterRecommendations(
      [{ ...item, developmentDomains: undefined }],
      filters,
    ),
  ).toHaveLength(0);
});
it('does not require optional metadata when the corresponding filter is empty', () => {
  expect(
    filterRecommendations(sampleActivities, {
      name: '',
      age: '',
      materials: [],
      categories: [],
      domains: [],
    }),
  ).toEqual(sampleActivities);
});
