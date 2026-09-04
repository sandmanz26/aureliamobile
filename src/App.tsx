import { Navigate, Route, Routes } from 'react-router-dom'
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
