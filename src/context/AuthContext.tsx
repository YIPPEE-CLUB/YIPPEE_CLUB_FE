import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { apiRequest, readTokens, saveTokens, type Tokens } from '../lib/api';

export interface User {
  id: number;
  email: string;
  name: string;
  nickname: string;
  active_child_id: number | null;
}
interface AuthState {
  user: User | null;
  ready: boolean;
  establish: (tokens: Tokens) => Promise<void>;
  logout: () => Promise<void>;
  reload: () => Promise<void>;
}
const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  async function reload() {
    setUser(await apiRequest<User>('/users/me'));
  }
  async function establish(tokens: Tokens) {
    saveTokens(tokens);
    await reload();
  }
  async function logout() {
    const tokens = readTokens();
    try {
      if (tokens)
        await apiRequest('/auth/logout', {
          method: 'POST',
          body: JSON.stringify({ refresh_token: tokens.refresh_token }),
        });
    } finally {
      saveTokens(null);
      setUser(null);
    }
  }
  useEffect(() => {
    let mounted = true;
    const expired = () => setUser(null);
    window.addEventListener('yippee:session-expired', expired);
    if (readTokens())
      apiRequest<User>('/users/me')
        .then((value) => {
          if (mounted) setUser(value);
        })
        .catch(() => {
          saveTokens(null);
        })
        .finally(() => {
          if (mounted) setReady(true);
        });
    else setReady(true);
    return () => {
      mounted = false;
      window.removeEventListener('yippee:session-expired', expired);
    };
  }, []);
  return (
    <AuthContext.Provider value={{ user, ready, establish, logout, reload }}>
      {children}
    </AuthContext.Provider>
  );
}
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('AuthProvider가 필요합니다.');
  return context;
}
