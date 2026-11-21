export interface NavigationEntry {
  key: string;
  path: string;
}
export type NavigationEntries = Record<number, NavigationEntry>;
const storageKey = 'yippee.navigation.entries';

export function readNavigation(): NavigationEntries {
  try {
    return JSON.parse(sessionStorage.getItem(storageKey) || '{}');
  } catch {
    return {};
  }
}
export function recordNavigation(
  index: number,
  entry: NavigationEntry,
  action: string,
) {
  try {
    const entries = index === 0 ? {} : readNavigation();
    if (action === 'PUSH')
      for (const key of Object.keys(entries)) {
        if (Number(key) >= index) delete entries[Number(key)];
      }
    entries[index] = entry;
    sessionStorage.setItem(storageKey, JSON.stringify(entries));
  } catch {
    /* 저장소를 사용할 수 없으면 화면별 기본 경로를 사용합니다. */
  }
}

// 같은 화면이 중복된 이력은 건너뛰고, 확인되지 않은 이력 밖으로 나가지 않습니다.
export function backOffset(
  entries: NavigationEntries,
  index: number,
  current: NavigationEntry,
): number | null {
  if (
    !Number.isInteger(index) ||
    index < 1 ||
    entries[index]?.key !== current.key
  )
    return null;
  for (let previous = index - 1; previous >= 0; previous--) {
    const entry = entries[previous];
    if (!entry || !entry.path.startsWith('/') || entry.path.startsWith('//'))
      return null;
    if (entry.path !== current.path) return previous - index;
  }
  return null;
}
