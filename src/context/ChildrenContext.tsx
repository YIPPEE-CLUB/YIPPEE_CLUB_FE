import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useAuth } from './AuthContext';
import {
  listChildren,
  createChild,
  updateChild,
  deleteChild,
  selectChild,
  type Child,
  type ChildInput,
} from '../services/children';
export type { Child } from '../services/children';

interface ChildrenState {
  children: Child[];
  activeChild: Child | undefined;
  loading: boolean;
  error: string;
  reload: () => Promise<void>;
  save: (data: ChildInput, id?: number) => Promise<void>;
  remove: (id: number) => Promise<void>;
  select: (id: number) => Promise<void>;
}
const Context = createContext<ChildrenState | null>(null);

export function ChildrenProvider({
  children: content,
}: {
  children: ReactNode;
}) {
  const { user, setActiveChild } = useAuth();
  const owner = user?.id ?? null;
  const identity = useRef(owner);
  const version = useRef(0);
  const listVersion = useRef(0);
  const selecting = useRef(false);
  if (identity.current !== owner) {
    identity.current = owner;
    version.current++;
  }
  const [state, setState] = useState<{
    owner: number | null;
    rows: Child[];
  }>({ owner: null, rows: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const children = state.owner === owner ? state.rows : [];
  const activeChild = children.find(
    (child) => child.id === user?.active_child_id,
  );
  async function reload() {
    const epoch = version.current;
    const request = ++listVersion.current;
    if (owner === null) return;
    setLoading(true);
    setError('');
    try {
      const rows = await listChildren();
      if (epoch !== version.current || request !== listVersion.current) return;
      setState({ owner, rows });
    } catch (cause) {
      if (epoch === version.current && request === listVersion.current)
        setError((cause as Error).message);
    } finally {
      if (epoch === version.current && request === listVersion.current)
        setLoading(false);
    }
  }
  function checkOwner(expected: number | null) {
    if (expected === null || identity.current !== expected)
      throw new Error('로그인 상태가 변경됐어요. 다시 시도해 주세요.');
  }
  async function save(data: ChildInput, id?: number) {
    checkOwner(owner);
    const expectedVersion = version.current;
    const child =
      id === undefined ? await createChild(data) : await updateChild(id, data);
    checkOwner(owner);
    if (expectedVersion !== version.current)
      throw new Error('아이 정보가 변경됐어요. 목록을 확인해 주세요.');
    listVersion.current++;
    setLoading(false);
    setError('');
    setState((previous) => {
      const rows = previous.owner === owner ? previous.rows : [];
      return {
        owner,
        rows: [...rows.filter((row) => row.id !== child.id), child].sort(
          (a, b) => a.id - b.id,
        ),
      };
    });
    if (loading) void reload();
  }
  async function remove(id: number) {
    checkOwner(owner);
    const expectedVersion = version.current;
    await deleteChild(id);
    checkOwner(owner);
    if (expectedVersion !== version.current)
      throw new Error('아이 정보가 변경됐어요. 목록을 다시 확인해 주세요.');
    listVersion.current++;
    setLoading(false);
    setError('');
    setState((previous) => ({
      ...previous,
      rows: previous.rows.filter((child) => child.id !== id),
    }));
    if (user?.active_child_id === id) setActiveChild(null, id);
    if (loading) void reload();
  }
  async function select(id: number) {
    checkOwner(owner);
    if (selecting.current)
      throw new Error(
        '아이 선택을 처리하고 있어요. 잠시 후 다시 시도해 주세요.',
      );
    if (!children.some((child) => child.id === id))
      throw new Error('아이 목록을 다시 확인해 주세요.');
    const epoch = version.current;
    selecting.current = true;
    try {
      const response = await selectChild(id);
      checkOwner(owner);
      if (epoch !== version.current)
        throw new Error('로그인 상태가 변경됐어요. 다시 시도해 주세요.');
      setActiveChild(response.active_child_id);
    } finally {
      selecting.current = false;
    }
  }
  useEffect(() => {
    setError('');
    setState({ owner, rows: [] });
    setLoading(false);
    if (owner !== null) void reload();
    return () => {
      version.current++;
    };
  }, [owner]);
  return (
    <Context.Provider
      value={{
        children,
        activeChild,
        loading,
        error,
        reload,
        save,
        remove,
        select,
      }}
    >
      {content}
    </Context.Provider>
  );
}
export function useChildren() {
  const value = useContext(Context);
  if (!value) throw new Error('ChildrenProvider가 필요해요.');
  return value;
}
