import { ActivityCatalog } from '../components/ActivityCatalog';
import type { CatalogProps } from './HomePage';
export function ActivitiesPage(props: CatalogProps) {
  return <ActivityCatalog {...props} />;
}
