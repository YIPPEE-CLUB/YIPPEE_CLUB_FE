import type { Activity } from '../types';
export function recommendActivities(
  items: Activity[],
  child?: { birth_date: string; interests: number[] },
  today = new Date(),
): Activity[] {
  if (!child) return items.slice(0, 20);
  const birth = new Date(`${child.birth_date}T00:00:00`);
  const months =
    (today.getFullYear() - birth.getFullYear()) * 12 +
    today.getMonth() -
    birth.getMonth() -
    (today.getDate() < birth.getDate() ? 1 : 0);
  return items
    .filter((item) =>
      item.ageMinMonths !== undefined && item.ageMaxMonths !== undefined
        ? item.ageMinMonths <= months && item.ageMaxMonths >= months
        : Math.abs(item.ageYears - Math.floor(months / 12)) <= 1,
    )
    .map((item, index) => ({
      item,
      index,
      score:
        item.categoryIds?.filter((id) => child.interests.includes(id)).length ||
        0,
    }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map(({ item }) => item)
    .slice(0, 20);
}

export interface PlayFilters {
  name: string;
  age: string;
  materials: string[];
  categories: string[];
  domains: string[];
}
export function filterRecommendations(
  items: Activity[],
  filters: PlayFilters,
): Activity[] {
  return items.filter((item) => {
    const months = Number(filters.age) * 12;
    return (
      (!filters.age ||
        (item.ageMinMonths !== undefined && item.ageMaxMonths !== undefined
          ? item.ageMinMonths <= months + 11 && item.ageMaxMonths >= months
          : item.ageYears === Number(filters.age))) &&
      (!filters.categories.length ||
        filters.categories.some((name) =>
          (item.categoryNames || [item.category]).includes(name),
        )) &&
      (!filters.materials.length ||
        (!!item.materials &&
          item.materials.every((material) =>
            filters.materials.includes(material),
          ))) &&
      (!filters.domains.length ||
        filters.domains.some((domain) =>
          item.developmentDomains?.includes(domain),
        ))
    );
  });
}
