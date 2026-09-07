import { Navigate, Route, Routes } from 'react-router-dom'
import { AdminLayout } from './admin/AdminLayout'
import { AuthProvider } from './auth/AuthContext'
import { RequireAuth } from './auth/RequireAuth'
import { AiMonitoring } from './admin/pages/AiMonitoring'
import { AuditPage } from './admin/pages/AuditPage'
import { CoinsPage } from './admin/pages/CoinsPage'
import { CompliancePage } from './admin/pages/CompliancePage'
import { DashboardPage } from './admin/pages/DashboardPage'
import { ExperimentsPage } from './admin/pages/ExperimentsPage'
import { ModerationPage } from './admin/pages/ModerationPage'
import { NotificationsPage } from './admin/pages/NotificationsPage'
import { PaymentsPage } from './admin/pages/PaymentsPage'
import { PricingPage } from './admin/pages/PricingPage'
import { RevenuePage } from './admin/pages/RevenuePage'
import { RolesPage } from './admin/pages/RolesPage'
import { SessionsPage } from './admin/pages/SessionsPage'
import { SettingsPage } from './admin/pages/SettingsPage'
import { UsersPage } from './admin/pages/UsersPage'
import { FeatureFlagsProvider } from './demo/FeatureFlags'
import { ModuleGuard } from './demo/ModuleGuard'
import { AppLayout } from './layouts/AppLayout'
import { ChatPage } from './pages/ChatPage'
import { DemoControlPage } from './pages/DemoControlPage'
import { HomePage } from './pages/HomePage'
import { PlaceholderPage } from './pages/PlaceholderPage'
import { ProfilePage } from './pages/ProfilePage'
import { RecreatePage } from './pages/RecreatePage'
import { SessionDetailPage } from './pages/SessionDetailPage'
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage'
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage'
import { SignInPage } from './pages/auth/SignInPage'
import { SignUpPage } from './pages/auth/SignUpPage'
import { InvitePage } from './pages/InvitePage'

export default function App() {
  return (
    <FeatureFlagsProvider>
      <AuthProvider>
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
                <SessionsPage />
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
                <NotificationsPage />
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
          <Route element={<AppLayout />}>
            <Route
              path="/home"
              element={
                <ModuleGuard module="home">
                  <HomePage />
                </ModuleGuard>
              }
            />
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
                    <PlaceholderPage title="Explore" description="Browse and search the wider session catalogue." />
                  </ModuleGuard>
                </RequireAuth>
              }
            />
            <Route
              path="/sessions"
              element={
                <RequireAuth>
                  <ModuleGuard module="sessions">
                    <PlaceholderPage title="Sessions" description="Your library of created and saved sessions." />
                  </ModuleGuard>
                </RequireAuth>
              }
            />
            <Route
              path="/wellness"
              element={
                <RequireAuth>
                  <ModuleGuard module="wellness">
                    <PlaceholderPage
                      title="My wellness"
                      description="Progress tracking — chapters, mood baseline and social impact."
                    />
                  </ModuleGuard>
                </RequireAuth>
              }
            />
          </Route>
          {/* Home is the front door now — a visitor can read it without an account. */}
          <Route path="/" element={<Navigate to="/home" replace />} />
        </Routes>
      </AuthProvider>
    </FeatureFlagsProvider>
  )
}
