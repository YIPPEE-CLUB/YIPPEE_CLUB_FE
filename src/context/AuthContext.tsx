import {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  type ReactNode,
} from 'react';
import {
  ApiError,
  apiRequest,
  readTokens,
  saveTokens,
  type Tokens,
} from '../lib/api';
import {
  getProfile,
  updateProfile,
  mergeProfileUpdate,
  type ProfileRead,
} from '../services/profile';
import {
  readPreviewSession,
  createPreviewSession,
  clearPreviewSession,
} from '../lib/preview-session';

export type User = ProfileRead;
interface AuthState {
  user: User | null;
  ready: boolean;
  sessionError: string;
  establish: (tokens: Tokens) => Promise<void>;
  logout: () => Promise<void>;
  reload: () => Promise<void>;
  saveProfile: (name: string, nickname?: string) => Promise<void>;
  clearSession: () => void;
  setActiveChild: (id: number | null, replacing?: number) => void;
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
  const [sessionError, setSessionError] = useState('');
  const generation = useRef(0);
  const profileRevision = useRef(0);
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
    generation.current++;
    setSessionError('');
    const previewUser = createPreviewSession(email);
    saveTokens(null);
    setUser(previewUser);
    setIsPreview(true);
    setReady(true);
    setLoginPromptOpen(false);
    setLoginNotice(true);
  }
  async function reload() {
    const version = generation.current;
    const revision = profileRevision.current;
    const session = readTokens()?.refresh_token;
    try {
      const profile = await getProfile();
      if (
        generation.current === version &&
        profileRevision.current === revision &&
        readTokens()?.refresh_token === session
      ) {
        setUser(profile);
        setSessionError('');
      }
    } catch (cause) {
      if (generation.current !== version) return;
      if (cause instanceof ApiError && cause.status === 401) {
        saveTokens(null);
        setUser(null);
        throw cause;
      }
      setSessionError('로그인 정보를 불러오지 못했어요. 다시 시도해 주세요.');
    }
  }
  async function saveProfile(name: string, nickname?: string) {
    const version = generation.current;
    const profile = await updateProfile(name, nickname);
    if (version !== generation.current)
      throw new Error('로그인 상태가 변경됐어요. 다시 로그인해 주세요.');
    profileRevision.current++;
    setUser((current) =>
      current && current.id === profile.id
        ? mergeProfileUpdate(current, profile)
        : current,
    );
    setSessionError('');
  }
  function setActiveChild(id: number | null, replacing?: number) {
    profileRevision.current++;
    setUser((current) =>
      current &&
      (replacing === undefined || current.active_child_id === replacing)
        ? { ...current, active_child_id: id }
        : current,
    );
  }
  function clearSession() {
    generation.current++;
    clearPreviewSession();
    saveTokens(null);
    setUser(null);
    setIsPreview(false);
    setSessionError('');
    setLoginNotice(false);
    setLoginPromptOpen(false);
  }
  async function establish(tokens: Tokens) {
    generation.current++;
    clearPreviewSession();
    setIsPreview(false);
    setUser(null);
    setSessionError('');
    saveTokens(tokens);
    await reload();
    setLoginPromptOpen(false);
    setLoginNotice(true);
  }
  async function logout() {
    generation.current++;
    const tokens = readTokens();
    const preview = readPreviewSession();
    clearPreviewSession();
    saveTokens(null);
    setUser(null);
    setIsPreview(false);
    setSessionError('');
    setLoginNotice(false);
    if (!preview && tokens) {
      await apiRequest('/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ refresh_token: tokens.refresh_token }),
      });
    }
  }
  useEffect(() => {
    let mounted = true;
    const expired = () => {
      generation.current++;
      setUser(null);
      setSessionError('로그인이 만료됐어요. 다시 로그인해 주세요.');
    };
    window.addEventListener('yippee:session-expired', expired);
    const preview = readPreviewSession();
    if (preview) {
      setUser(preview.user);
      setIsPreview(true);
      setReady(true);
    } else if (readTokens()) {
      void reload()
        .catch(() => {})
        .finally(() => {
          if (mounted) setReady(true);
        });
    } else setReady(true);
    return () => {
      mounted = false;
      generation.current++;
      window.removeEventListener('yippee:session-expired', expired);
    };
  }, []);
  return (
    <AuthContext.Provider
      value={{
        user,
        ready,
        sessionError,
        establish,
        logout,
        reload,
        saveProfile,
        clearSession,
        setActiveChild,
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
