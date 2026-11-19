import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { apiRequest, readTokens, saveTokens, type Tokens } from '../lib/api';
import {
  readPreviewSession,
  createPreviewSession,
  clearPreviewSession,
} from '../lib/preview-session';

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
  previewLogin: (email: string) => void;
  isPreview: boolean;
  loginNotice: boolean;
  loginPromptOpen: boolean;
  requestLogin: () => void;
  dismissLogin: () => void;
}
const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [loginNotice, setLoginNotice] = useState(false);
  const [loginPromptOpen, setLoginPromptOpen] = useState(false);
  const requestLogin = () => setLoginPromptOpen(true);
  function dismissLogin() {
    sessionStorage.setItem('yippee.guest.browsing', 'true');
    setLoginPromptOpen(false);
  }
  useEffect(() => {
    if (!loginNotice) return;
    const timer = setTimeout(() => setLoginNotice(false), 2000);
    return () => clearTimeout(timer);
  }, [loginNotice]);
  function previewLogin(email: string) {
    const previewUser = createPreviewSession(email);
    saveTokens(null);
    setUser(previewUser);
    setIsPreview(true);
    setReady(true);
    setLoginPromptOpen(false);
    setLoginNotice(true);
  }
  async function reload() {
    setUser(await apiRequest<User>('/users/me'));
  }
  async function establish(tokens: Tokens) {
    clearPreviewSession();
    setIsPreview(false);
    saveTokens(tokens);
    await reload();
    setLoginPromptOpen(false);
    setLoginNotice(true);
  }
  async function logout() {
    setLoginNotice(false);
    if (readPreviewSession()) {
      clearPreviewSession();
      setIsPreview(false);
      setUser(null);
      return;
    }
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
    const preview = readPreviewSession();
    if (preview) {
      setUser(preview.user);
      setIsPreview(true);
      setReady(true);
    } else if (readTokens())
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
    <AuthContext.Provider
      value={{
        user,
        ready,
        establish,
        logout,
        reload,
        previewLogin,
        isPreview,
        loginNotice,
        loginPromptOpen,
        requestLogin,
        dismissLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('AuthProvider가 필요합니다.');
  return context;
}
