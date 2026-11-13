import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { useAuth } from './AuthContext';
import { apiRequest } from '../lib/api';
import type { Paginated } from '../types';

export interface Child {
  id: number;
  name: string;
  birth_date: string;
  gender: string;
  interests: number[];
}
interface ChildrenState {
  children: Child[];
  loading: boolean;
  error: string;
  reload: () => Promise<void>;
}
const Context = createContext<ChildrenState | null>(null);

// 홈·하단 아이 전환·아이 관리가 같은 서버 데이터를 사용하도록 공유합니다.
export function ChildrenProvider({
  children: content,
}: {
  children: ReactNode;
}) {
  const { user } = useAuth();
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  async function reload() {
    if (!user) {
      setChildren([]);
      return;
    }
    setLoading(true);
    setError('');
    try {
      setChildren(
        (await apiRequest<Paginated<Child>>('/children?page_size=100')).results,
      );
    } catch (cause) {
      setError((cause as Error).message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    let active = true;
    setChildren([]);
    setError('');
    if (user) {
      setLoading(true);
      apiRequest<Paginated<Child>>('/children?page_size=100')
        .then((page) => {
          if (active) setChildren(page.results);
        })
        .catch((cause: Error) => {
          if (active) setError(cause.message);
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    } else setLoading(false);
    return () => {
      active = false;
    };
  }, [user?.id]);
  return (
    <Context.Provider value={{ children, loading, error, reload }}>
      {content}
    </Context.Provider>
  );
}
export function useChildren() {
  const value = useContext(Context);
  if (!value) throw new Error('ChildrenProvider가 필요해요.');
  return value;
}
