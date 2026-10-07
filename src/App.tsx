import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AdminLayout } from './admin/AdminLayout'
import { AudioPlayerProvider } from './audio/AudioPlayerContext'
import { AuthProvider } from './auth/AuthContext'
import { ChatSessionProvider } from './chat/ChatSessionContext'
import { RequireAuth } from './auth/RequireAuth'
import { SiteLock } from './components/SiteLock'
import { PageSkeleton } from './components/ui/PageSkeleton'
import { FeatureFlagsProvider } from './demo/FeatureFlags'
import { ModuleGuard } from './demo/ModuleGuard'
import { DemoAnnotator } from './demo/annotations/DemoAnnotator'
import { AppLayout } from './layouts/AppLayout'
import { DemoControlPage } from './pages/DemoControlPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage'
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage'
import { SignInPage } from './pages/auth/SignInPage'
import { SignUpPage } from './pages/auth/SignUpPage'

// The consumer app's own pages, lazily — each becomes its own chunk, and
// AppLayout wraps its <Outlet /> in a <Suspense> that shows PageSkeleton
// while one is still downloading. Auth and the demo console stay eager:
// they're either the first thing a cold load needs or a separate
// desktop-only area this doesn't touch.
const ChallengeDetailPage = lazy(() => import('./pages/ChallengeDetailPage').then((m) => ({ default: m.ChallengeDetailPage })))
const ChatPage = lazy(() => import('./pages/ChatPage').then((m) => ({ default: m.ChatPage })))
const ProgressPage = lazy(() => import('./pages/ProgressPage').then((m) => ({ default: m.ProgressPage })))
const HelpPage = lazy(() => import('./pages/HelpPage').then((m) => ({ default: m.HelpPage })))
const HomePage = lazy(() => import('./pages/HomePage').then((m) => ({ default: m.HomePage })))
const NotificationsPage = lazy(() => import('./pages/NotificationsPage').then((m) => ({ default: m.NotificationsPage })))
const SessionSettingsPage = lazy(() => import('./pages/SessionSettingsPage').then((m) => ({ default: m.SessionSettingsPage })))
const WellnessPage = lazy(() => import('./pages/WellnessPage').then((m) => ({ default: m.WellnessPage })))
const ProfilePage = lazy(() => import('./pages/ProfilePage').then((m) => ({ default: m.ProfilePage })))
const SeeAllPage = lazy(() => import('./pages/SeeAllPage').then((m) => ({ default: m.SeeAllPage })))
const ExplorePage = lazy(() => import('./pages/ExplorePage').then((m) => ({ default: m.ExplorePage })))
const SessionsPage = lazy(() => import('./pages/SessionsPage').then((m) => ({ default: m.SessionsPage })))
const PlayerPage = lazy(() => import('./pages/PlayerPage').then((m) => ({ default: m.PlayerPage })))
const RecreateRoute = lazy(() => import('./pages/RecreatePage').then((m) => ({ default: m.RecreateRoute })))
const SessionDetailPage = lazy(() => import('./pages/SessionDetailPage').then((m) => ({ default: m.SessionDetailPage })))
const AccountSettingsPage = lazy(() => import('./pages/AccountSettingsPage').then((m) => ({ default: m.AccountSettingsPage })))
const InvitePage = lazy(() => import('./pages/InvitePage').then((m) => ({ default: m.InvitePage })))
const CreditsPage = lazy(() => import('./pages/CreditsPage').then((m) => ({ default: m.CreditsPage })))
const UpgradePage = lazy(() => import('./pages/UpgradePage').then((m) => ({ default: m.UpgradePage })))
const AboutLayoutPage = lazy(() => import('./pages/dev/AboutLayoutPage').then((m) => ({ default: m.AboutLayoutPage })))
const GalleryLayoutPage = lazy(() => import('./pages/dev/GalleryLayoutPage').then((m) => ({ default: m.GalleryLayoutPage })))

// The admin CMS's own pages, lazily for the same reason — 18 modules shipped
// in the same chunk as the shell meant every admin visitor downloaded all of
// them to see the Dashboard. AdminLayout wraps its own <Outlet /> in a
// <Suspense> the same way AppLayout does.
const DashboardPage = lazy(() => import('./admin/pages/DashboardPage').then((m) => ({ default: m.DashboardPage })))
const UsersPage = lazy(() => import('./admin/pages/UsersPage').then((m) => ({ default: m.UsersPage })))
const UserDetailPage = lazy(() => import('./admin/pages/UserDetailPage').then((m) => ({ default: m.UserDetailPage })))
const RolesPage = lazy(() => import('./admin/pages/RolesPage').then((m) => ({ default: m.RolesPage })))
const AdminSessionsPage = lazy(() => import('./admin/pages/SessionsPage').then((m) => ({ default: m.SessionsPage })))
const AdminChallengesPage = lazy(() => import('./admin/pages/ChallengesPage').then((m) => ({ default: m.ChallengesPage })))
const ModerationPage = lazy(() => import('./admin/pages/ModerationPage').then((m) => ({ default: m.ModerationPage })))
const AiMonitoring = lazy(() => import('./admin/pages/AiMonitoring').then((m) => ({ default: m.AiMonitoring })))
const CockpitRulesPage = lazy(() => import('./admin/pages/CockpitRulesPage').then((m) => ({ default: m.CockpitRulesPage })))
const RevenuePage = lazy(() => import('./admin/pages/RevenuePage').then((m) => ({ default: m.RevenuePage })))
const PricingPage = lazy(() => import('./admin/pages/PricingPage').then((m) => ({ default: m.PricingPage })))
const PaymentsPage = lazy(() => import('./admin/pages/PaymentsPage').then((m) => ({ default: m.PaymentsPage })))
const CoinsPage = lazy(() => import('./admin/pages/CoinsPage').then((m) => ({ default: m.CoinsPage })))
const ExperimentsPage = lazy(() => import('./admin/pages/ExperimentsPage').then((m) => ({ default: m.ExperimentsPage })))
const AdminNotificationsPage = lazy(() => import('./admin/pages/NotificationsPage').then((m) => ({ default: m.NotificationsPage })))
const CompliancePage = lazy(() => import('./admin/pages/CompliancePage').then((m) => ({ default: m.CompliancePage })))
const SignalSourcesPage = lazy(() => import('./admin/pages/SignalSourcesPage').then((m) => ({ default: m.SignalSourcesPage })))
const AuditPage = lazy(() => import('./admin/pages/AuditPage').then((m) => ({ default: m.AuditPage })))
const SettingsPage = lazy(() => import('./admin/pages/SettingsPage').then((m) => ({ default: m.SettingsPage })))

export default function App() {
  return (
    <FeatureFlagsProvider>
      <SiteLock>
      <AuthProvider>
        {/* Above the router on purpose: a session being built has to survive
            leaving /chat to play it and coming back. */}
        <AudioPlayerProvider>
        <ChatSessionProvider>
        <Routes>
          {/* Unlisted presenter console — see src/demo/modules.ts */}
          <Route path="/__demo" element={<DemoControlPage />} />

          {/* Unlisted layout probes — dummy business, no Aurelia content, not
              linked from anywhere in the app. See src/pages/dev/. */}
          <Route
            path="/__about"
            element={
              <Suspense fallback={<PageSkeleton />}>
                <AboutLayoutPage />
              </Suspense>
            }
          />
          <Route
            path="/__about/gallery"
            element={
              <Suspense fallback={<PageSkeleton />}>
                <GalleryLayoutPage />
              </Suspense>
            }
          />

          {/* Super-admin CMS — its own shell, outside the consumer app layout */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={
              <ModuleGuard module="admin">
                <DashboardPage />
              </ModuleGuard>
            } />
            <Route path="users" element={
              <ModuleGuard module="adminUsers">
                <UsersPage />
              </ModuleGuard>
            } />
            <Route path="users/:id" element={
              <ModuleGuard module="adminUsers">
                <UserDetailPage />
              </ModuleGuard>
            } />
            <Route path="roles" element={
              <ModuleGuard module="adminRoles">
                <RolesPage />
              </ModuleGuard>
            } />
            <Route path="sessions" element={
              <ModuleGuard module="adminSessions">
                <AdminSessionsPage />
              </ModuleGuard>
            } />
            <Route path="challenges" element={
              <ModuleGuard module="adminChallenges">
                <AdminChallengesPage />
              </ModuleGuard>
            } />
            <Route path="moderation" element={
              <ModuleGuard module="adminModeration">
                <ModerationPage />
              </ModuleGuard>
            } />
            <Route path="ai" element={
              <ModuleGuard module="adminAi">
                <AiMonitoring />
              </ModuleGuard>
            } />
            <Route path="cockpit-rules" element={
              <ModuleGuard module="adminCockpitRules">
                <CockpitRulesPage />
              </ModuleGuard>
            } />
            <Route path="revenue" element={
              <ModuleGuard module="adminRevenue">
                <RevenuePage />
              </ModuleGuard>
            } />
            <Route path="pricing" element={
              <ModuleGuard module="adminPricing">
                <PricingPage />
              </ModuleGuard>
            } />
            <Route path="payments" element={
              <ModuleGuard module="adminPayments">
                <PaymentsPage />
              </ModuleGuard>
            } />
            <Route path="coins" element={
              <ModuleGuard module="adminCoins">
                <CoinsPage />
              </ModuleGuard>
            } />
            <Route path="experiments" element={
              <ModuleGuard module="adminExperiments">
                <ExperimentsPage />
              </ModuleGuard>
            } />
            <Route path="notifications" element={
              <ModuleGuard module="adminNotifications">
                <AdminNotificationsPage />
              </ModuleGuard>
            } />
            <Route path="compliance" element={
              <ModuleGuard module="adminCompliance">
                <CompliancePage />
              </ModuleGuard>
            } />
            <Route path="signal-sources" element={
              <ModuleGuard module="adminSignalSources">
                <SignalSourcesPage />
              </ModuleGuard>
            } />
            <Route path="audit" element={
              <ModuleGuard module="adminAudit">
                <AuditPage />
              </ModuleGuard>
            } />
            <Route path="settings" element={
              <ModuleGuard module="adminSettings">
                <SettingsPage />
              </ModuleGuard>
            } />
          </Route>

          <Route path="/login" element={<SignInPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          {/* Full-bleed, outside AppLayout: the art runs to the top edge and the
              screen carries its own back/share header, so the shell's status
              band and drawer would both sit on top of the cover. */}
          <Route
            path="/play/:slug"
            element={
              <RequireAuth>
                <ModuleGuard module="player">
                  {/* Full-bleed, outside AppLayout's own Suspense boundary,
                      so it needs one of its own. */}
                  <Suspense fallback={<PageSkeleton />}>
                    <PlayerPage />
                  </Suspense>
                </ModuleGuard>
              </RequireAuth>
            }
          />
          <Route element={<AppLayout />}>
            <Route
              path="/home"
              element={
                <ModuleGuard module="home">
                  <HomePage />
                </ModuleGuard>
              }
            />
            {/* /chat is a new session; /chat/:slug is the conversation that
                made an existing one, which is what a row in Sessions opens. */}
            <Route
              path="/chat"
              element={
                <RequireAuth>
                  <ModuleGuard module="chat">
                    <ChatPage />
                  </ModuleGuard>
                </RequireAuth>
              }
            />
            <Route
              path="/chat/:slug"
              element={
                <RequireAuth>
                  <ModuleGuard module="chat">
                    <ChatPage />
                  </ModuleGuard>
                </RequireAuth>
              }
            />
            {/* What a session has done since it was made — Insights in the
                cockpit's menu. The tab lives in the query string. */}
            <Route
              path="/progress/:slug"
              element={
                <RequireAuth>
                  <ModuleGuard module="chat">
                    <ProgressPage />
                  </ModuleGuard>
                </RequireAuth>
              }
            />
            <Route
              path="/profile"
              element={
                <RequireAuth>
                  <ModuleGuard module="profile">
                    <ProfilePage />
                  </ModuleGuard>
                </RequireAuth>
              }
            />
            <Route
              path="/settings"
              element={
                <RequireAuth>
                  <ModuleGuard module="settings">
                    <AccountSettingsPage />
                  </ModuleGuard>
                </RequireAuth>
              }
            />
            <Route
              path="/profile/:person"
              element={
                <RequireAuth>
                  <ModuleGuard module="profile">
                    <ProfilePage />
                  </ModuleGuard>
                </RequireAuth>
              }
            />
            <Route
              path="/session/:slug"
              element={
                <RequireAuth>
                  <ModuleGuard module="sessionDetail">
                    <SessionDetailPage />
                  </ModuleGuard>
                </RequireAuth>
              }
            />
            <Route
              path="/recreate/:slug"
              element={
                <RequireAuth>
                  <ModuleGuard module="recreate">
                    <RecreateRoute />
                  </ModuleGuard>
                </RequireAuth>
              }
            />
            <Route
              path="/notifications"
              element={
                <RequireAuth>
                  <ModuleGuard module="notifications">
                    <NotificationsPage />
                  </ModuleGuard>
                </RequireAuth>
              }
            />
            {/* Help is open: someone locked out of their account still needs it. */}
            <Route
              path="/help"
              element={
                <ModuleGuard module="help">
                  <HelpPage />
                </ModuleGuard>
              }
            />
            <Route
              path="/see-all/:shelf"
              element={
                <RequireAuth>
                  <ModuleGuard module="seeAll">
                    <SeeAllPage />
                  </ModuleGuard>
                </RequireAuth>
              }
            />
            <Route
              path="/challenge/:slug"
              element={
                <RequireAuth>
                  <ModuleGuard module="challenge">
                    <ChallengeDetailPage />
                  </ModuleGuard>
                </RequireAuth>
              }
            />
            <Route
              path="/invite"
              element={
                <RequireAuth>
                  <ModuleGuard module="invite">
                    <InvitePage />
                  </ModuleGuard>
                </RequireAuth>
              }
            />
            <Route
              path="/explore"
              element={
                <RequireAuth>
                  <ModuleGuard module="explore">
                    <ExplorePage />
                  </ModuleGuard>
                </RequireAuth>
              }
            />
            <Route
              path="/sessions"
              element={
                <RequireAuth>
                  <ModuleGuard module="sessions">
                    <SessionsPage />
                  </ModuleGuard>
                </RequireAuth>
              }
            />
            <Route
              path="/session-settings"
              element={
                <RequireAuth>
                  <ModuleGuard module="sessionSettings">
                    <SessionSettingsPage />
                  </ModuleGuard>
                </RequireAuth>
              }
            />
            {/* Where the coin balance goes, on all nine screens that draw it.
                Figma "Profile/Credits" (16658:29260) — and the design says so
                too: the coin pill in the Settings header transitions to this
                frame. */}
            {/* The paywall the cockpit's free limit offers. Its own route
                rather than a sheet: it is the only thing being asked, and a
                sheet would keep the stopped composer in view behind it. */}
            <Route
              path="/upgrade"
              element={
                <RequireAuth>
                  <ModuleGuard module="chat">
                    <UpgradePage />
                  </ModuleGuard>
                </RequireAuth>
              }
            />
            <Route
              path="/credits"
              element={
                <RequireAuth>
                  <CreditsPage />
                </RequireAuth>
              }
            />
            <Route
              path="/wellness"
              element={
                <RequireAuth>
                  <ModuleGuard module="wellness">
                    <WellnessPage />
                  </ModuleGuard>
                </RequireAuth>
              }
            />
          </Route>
          {/* Home is the front door now — a visitor can read it without an account. */}
          <Route path="/" element={<Navigate to="/home" replace />} />
          {/* Catch-all: without this, an unmatched path rendered nothing (no
              route to pick) and `vercel.json` still answers 200, so a dead
              link looked like a blank page that loaded fine instead of a 404. */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        {/* /__demo's "Review annotations" — renders nothing unless switched on there. */}
        <DemoAnnotator />
        </ChatSessionProvider>
        </AudioPlayerProvider>
      </AuthProvider>
      </SiteLock>
    </FeatureFlagsProvider>
  )
}
