import { Navigate, Route, Routes } from 'react-router-dom'
import { AdminLayout } from './admin/AdminLayout'
import { AudioPlayerProvider } from './audio/AudioPlayerContext'
import { AuthProvider } from './auth/AuthContext'
import { ChatSessionProvider } from './chat/ChatSessionContext'
import { RequireAuth } from './auth/RequireAuth'
import { AiMonitoring } from './admin/pages/AiMonitoring'
import { AuditPage } from './admin/pages/AuditPage'
import { CoinsPage } from './admin/pages/CoinsPage'
import { CompliancePage } from './admin/pages/CompliancePage'
import { DashboardPage } from './admin/pages/DashboardPage'
import { ExperimentsPage } from './admin/pages/ExperimentsPage'
import { ModerationPage } from './admin/pages/ModerationPage'
import { NotificationsPage as AdminNotificationsPage } from './admin/pages/NotificationsPage'
import { PaymentsPage } from './admin/pages/PaymentsPage'
import { PricingPage } from './admin/pages/PricingPage'
import { RevenuePage } from './admin/pages/RevenuePage'
import { RolesPage } from './admin/pages/RolesPage'
import { SessionsPage as AdminSessionsPage } from './admin/pages/SessionsPage'
import { SettingsPage } from './admin/pages/SettingsPage'
import { UsersPage } from './admin/pages/UsersPage'
import { SiteLock } from './components/SiteLock'
import { FeatureFlagsProvider } from './demo/FeatureFlags'
import { ModuleGuard } from './demo/ModuleGuard'
import { AppLayout } from './layouts/AppLayout'
import { ChallengeDetailPage } from './pages/ChallengeDetailPage'
import { ChatPage } from './pages/ChatPage'
import { ProgressPage } from './pages/ProgressPage'
import { DemoControlPage } from './pages/DemoControlPage'
import { HelpPage } from './pages/HelpPage'
import { HomePage } from './pages/HomePage'
import { NotificationsPage } from './pages/NotificationsPage'
import { SessionSettingsPage } from './pages/SessionSettingsPage'
import { WellnessPage } from './pages/WellnessPage'
import { ProfilePage } from './pages/ProfilePage'
import { SeeAllPage } from './pages/SeeAllPage'
import { ExplorePage } from './pages/ExplorePage'
import { SessionsPage } from './pages/SessionsPage'
import { PlayerPage } from './pages/PlayerPage'
import { RecreatePage } from './pages/RecreatePage'
import { SessionDetailPage } from './pages/SessionDetailPage'
import { AccountSettingsPage } from './pages/AccountSettingsPage'
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage'
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage'
import { SignInPage } from './pages/auth/SignInPage'
import { SignUpPage } from './pages/auth/SignUpPage'
import { InvitePage } from './pages/InvitePage'
import { CreditsPage } from './pages/CreditsPage'
import { UpgradePage } from './pages/UpgradePage'

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
                  <PlayerPage />
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
                    <RecreatePage />
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
        </Routes>
        </ChatSessionProvider>
        </AudioPlayerProvider>
      </AuthProvider>
      </SiteLock>
    </FeatureFlagsProvider>
  )
}
