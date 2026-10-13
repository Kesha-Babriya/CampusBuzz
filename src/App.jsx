import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Layout from './components/layout/Layout';
import HomePage from './pages/Home/HomePage';
import EventsPage from './pages/Events/EventsPage';
import EventDetailPage from './pages/Events/EventDetailPage';
import CalendarPage from './pages/Calendar/CalendarPage';
import ClubsPage from './pages/Clubs/ClubsPage';
import ClubDetailPage from './pages/Clubs/ClubDetailPage';
import QuizPage from './pages/Quiz/QuizPage';
import SavedEventsPage from './pages/Saved/SavedEventsPage';
import LoungePage from './pages/Lounge/LoungePage';
import LoginPage from './pages/Auth/LoginPage';
import SignupPage from './pages/Auth/SignupPage';
import ProfilePage from './pages/Profile/ProfilePage';
import OrganizerDashboardPage from './pages/Organizer/OrganizerDashboardPage';
import CreateEventPage from './pages/Organizer/CreateEventPage';
import AdminDashboardPage from './pages/Admin/AdminDashboardPage';
import NotFoundPage from './pages/NotFoundPage';
import ProtectedRoute from './components/common/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { SavedEventsProvider } from './context/SavedEventsContext';

// Scroll to top helper that triggers on client-side React Router navigation changes
function ScrollToTop() {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SavedEventsProvider>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Layout />}>
              {/* Public Routes */}
              <Route index element={<HomePage />} />
              <Route path="events" element={<EventsPage />} />
              <Route path="events/:id" element={<EventDetailPage />} />
              <Route path="calendar" element={<CalendarPage />} />
              <Route path="clubs" element={<ClubsPage />} />
              <Route path="clubs/:id" element={<ClubDetailPage />} />
              <Route path="quiz" element={<QuizPage />} />
              <Route path="saved" element={<SavedEventsPage />} />
              <Route path="lounge" element={<LoungePage />} />
              <Route path="login" element={<LoginPage />} />
              <Route path="signup" element={<SignupPage />} />

              {/* Authenticated User Profile */}
              <Route
                path="profile"
                element={
                  <ProtectedRoute allowedRoles={['student', 'organizer', 'admin']}>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              
              {/* Protected Club Head / Organizer Portal */}
              <Route
                path="organizer"
                element={
                  <ProtectedRoute allowedRoles={['organizer', 'admin']}>
                    <OrganizerDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="organizer/events"
                element={
                  <ProtectedRoute allowedRoles={['organizer', 'admin']}>
                    <OrganizerDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="organizer/events/create"
                element={
                  <ProtectedRoute allowedRoles={['organizer', 'admin']}>
                    <CreateEventPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="organizer/events/:id/edit"
                element={
                  <ProtectedRoute allowedRoles={['organizer', 'admin']}>
                    <CreateEventPage />
                  </ProtectedRoute>
                }
              />

              {/* Protected Main Admin Portal */}
              <Route
                path="admin"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboardPage />
                  </ProtectedRoute>
                }
              />

              {/* Catch-all 404 */}
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </SavedEventsProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
