import { Navigate, Route, Routes } from 'react-router-dom'
import { AdminLayout } from './admin/AdminLayout'
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
import { SignInPage } from './pages/SignInPage'

export default function App() {
  return (
    <FeatureFlagsProvider>
      <Routes>
        {/* Unlisted presenter console — see src/demo/modules.ts */}
        <Route path="/__demo" element={<DemoControlPage />} />

        {/* Super-admin CMS — its own shell, outside the consumer app layout */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="roles" element={<RolesPage />} />
          <Route path="sessions" element={<SessionsPage />} />
          <Route path="moderation" element={<ModerationPage />} />
          <Route path="ai" element={<AiMonitoring />} />
          <Route path="revenue" element={<RevenuePage />} />
          <Route path="pricing" element={<PricingPage />} />
          <Route path="payments" element={<PaymentsPage />} />
          <Route path="coins" element={<CoinsPage />} />
          <Route path="experiments" element={<ExperimentsPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="compliance" element={<CompliancePage />} />
          <Route path="audit" element={<AuditPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        <Route path="/login" element={<SignInPage />} />
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
              <ModuleGuard module="chat">
                <ChatPage />
              </ModuleGuard>
            }
          />
          <Route
            path="/profile"
            element={
              <ModuleGuard module="profile">
                <ProfilePage />
              </ModuleGuard>
            }
          />
          <Route
            path="/explore"
            element={
              <ModuleGuard module="explore">
                <PlaceholderPage title="Explore" description="Browse and search the wider session catalogue." />
              </ModuleGuard>
            }
          />
          <Route
            path="/sessions"
            element={
              <ModuleGuard module="sessions">
                <PlaceholderPage title="Sessions" description="Your library of created and saved sessions." />
              </ModuleGuard>
            }
          />
          <Route
            path="/wellness"
            element={
              <ModuleGuard module="wellness">
                <PlaceholderPage
                  title="My wellness"
                  description="Progress tracking — chapters, mood baseline and social impact."
                />
              </ModuleGuard>
            }
          />
        </Route>
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </FeatureFlagsProvider>
  )
}
