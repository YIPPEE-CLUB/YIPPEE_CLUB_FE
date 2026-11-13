import { useEffect, useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { Layout } from './components/Layout';
import { HomePage } from './screens/HomePage';
import { ActivitiesPage } from './screens/ActivitiesPage';
import {
  BadgesPage,
  ProfilePage,
  ProfileEditPage,
  SavedPage,
} from './screens/AccountPages';
import { listActivities } from './services/activities';
import type { Activity } from './types';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { apiRequest } from './lib/api';
import type { Paginated } from './types';
import { AuthPage } from './screens/AuthPage';
import { SearchPage } from './screens/SearchPage';
import {
  FAQPage,
  InquiryPage,
  InquiryHistoryPage,
  NoticesPage,
  TextDocumentPage,
  NotificationsPage,
  AccountFormPage,
} from './screens/SupportSubPages';
import {
  OnboardingPage,
  VersionPage,
  LicensesPage,
  WithdrawPage,
  ReviewsPage,
} from './screens/MoreScreens';
import { CartPage, ActivityDetailPage } from './screens/ConnectedPages';
import { ChildrenPage, ChildFormPage } from './screens/ChildrenPages';
import {
  ActivityTypesPage,
  GuidesPage,
  GuideDetailPage,
  HowToPage,
  EmptyScreen,
  SettingsPage,
  NotificationSettingsPage,
  SupportPage,
  RecommendationsPage,
  ViewerPage,
  CheckoutPage,
} from './screens/AdditionalPages';

export function App() {
  const { user, ready } = useAuth();
  const navigate = useNavigate();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  // 로그인한 사용자의 찜은 서버에 저장하며 사용자 변경 시 다시 조회합니다.
  const [savedIds, setSavedIds] = useState<number[]>([]);
  const { pathname } = useLocation();

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');

    listActivities(controller.signal)
      .then((items) => {
        if (!controller.signal.aborted) setActivities(items);
      })
      .catch((cause: unknown) => {
        if (!controller.signal.aborted)
          setError(
            cause instanceof Error
              ? cause.message
              : '활동지를 불러오지 못했어요.',
          );
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [attempt]);

  const [saving, setSaving] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    setSavedIds([]);
    if (user)
      apiRequest<Paginated<Activity>>('/favorites?page_size=100', {
        signal: controller.signal,
      })
        .then((page) => {
          if (!controller.signal.aborted)
            setSavedIds(page.results.map((item) => item.id));
        })
        .catch((cause: Error) => {
          if (!controller.signal.aborted) setError(cause.message);
        });
    return () => controller.abort();
  }, [user?.id]);

  async function toggleSaved(id: number) {
    if (!user) {
      navigate('/login');
      return;
    }
    if (saving) return;
    setSaving(true);
    try {
      const saved = savedIds.includes(id);
      await apiRequest(saved ? `/favorites/${id}` : '/favorites', {
        method: saved ? 'DELETE' : 'POST',
        ...(saved ? {} : { body: JSON.stringify({ activity_id: id }) }),
      });
      setSavedIds((previous) =>
        saved ? previous.filter((item) => item !== id) : [...previous, id],
      );
    } catch (cause) {
      setError((cause as Error).message);
    } finally {
      setSaving(false);
    }
  }

  const catalogProps = { activities, savedIds, onToggle: toggleSaved };
  const needsCatalog =
    pathname === '/' ||
    pathname.startsWith('/activities') ||
    pathname.startsWith('/search') ||
    pathname === '/saved';

  if (!ready)
    return (
      <div className="status-banner" role="status">
        로그인을 확인하고 있어요…
      </div>
    );

  return (
    <>
      {needsCatalog && loading && (
        <div className="status-banner" role="status">
          활동지를 불러오고 있어요…
        </div>
      )}
      {needsCatalog && error && (
        <div className="status-banner status-banner--error" role="alert">
          {error}
          <button onClick={() => setAttempt((value) => value + 1)}>
            다시 시도
          </button>
        </div>
      )}
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage {...catalogProps} />} />
          <Route
            path="activities"
            element={<ActivitiesPage {...catalogProps} />}
          />
          <Route
            path="activities/:activityId"
            element={<ActivityDetailPage {...catalogProps} />}
          />
          <Route path="saved" element={<SavedPage {...catalogProps} />} />
          <Route
            path="search"
            element={
              <SearchPage
                key={`input-${user?.id || 'guest'}`}
                {...catalogProps}
              />
            }
          />
          <Route
            path="search/results"
            element={
              <SearchPage
                key={`results-${user?.id || 'guest'}`}
                {...catalogProps}
              />
            }
          />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="profile/edit" element={<ProfileEditPage />} />
          <Route path="badges" element={<BadgesPage />} />
          <Route path="login" element={<AuthPage />} />
          <Route path="onboarding" element={<OnboardingPage />} />
          <Route path="version" element={<VersionPage />} />
          <Route path="licenses" element={<LicensesPage />} />
          <Route path="settings/withdraw" element={<WithdrawPage />} />
          <Route
            path="activities/:activityId/reviews"
            element={<ReviewsPage />}
          />
          <Route path="children" element={<ChildrenPage />} />
          <Route path="children/new" element={<ChildFormPage />} />
          <Route path="children/:childId/edit" element={<ChildFormPage />} />
          <Route path="cart" element={<CartPage />} />
          <Route
            path="checkout"
            element={<CheckoutPage activities={activities} />}
          />
          <Route
            path="recommendations"
            element={<RecommendationsPage {...catalogProps} />}
          />
          <Route path="activity-types" element={<ActivityTypesPage />} />
          <Route path="guide" element={<GuidesPage />} />
          <Route path="guides" element={<GuidesPage />} />
          <Route path="guides/:guideId" element={<GuideDetailPage />} />
          <Route path="how-to" element={<HowToPage />} />
          <Route path="viewer/:activityId" element={<ViewerPage />} />
          <Route path="orders" element={<EmptyScreen kind="orders" />} />
          <Route path="records" element={<EmptyScreen kind="records" />} />
          <Route path="cards" element={<EmptyScreen kind="cards" />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route
            path="settings/notifications"
            element={<NotificationSettingsPage />}
          />
          <Route path="support" element={<SupportPage />} />
          <Route path="support/faq" element={<FAQPage />} />
          <Route path="support/inquiries/new" element={<InquiryPage />} />
          <Route path="support/inquiries" element={<InquiryHistoryPage />} />
          <Route path="notices" element={<NoticesPage />} />
          <Route path="notices/:noticeId" element={<TextDocumentPage />} />
          <Route path="policies/:type" element={<TextDocumentPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="cards/new" element={<AccountFormPage kind="card" />} />
          <Route
            path="settings/password"
            element={<AccountFormPage kind="password" />}
          />
          <Route
            path="settings/phone"
            element={<AccountFormPage kind="phone" />}
          />
          <Route
            path="password/reset"
            element={<AccountFormPage kind="reset" />}
          />
          <Route
            path="system/network"
            element={<EmptyScreen kind="network" />}
          />
          <Route path="system/server" element={<EmptyScreen kind="server" />} />
          <Route
            path="system/maintenance"
            element={<EmptyScreen kind="maintenance" />}
          />
          <Route path="*" element={<EmptyScreen kind="missing" />} />
        </Route>
      </Routes>
    </>
  );
}
