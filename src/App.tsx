import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './i18n/LanguageContext';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import StoryPage from './pages/StoryPage';
import ObjectivePage from './pages/ObjectivePage';
import ContactPage from './pages/ContactPage';
import AdminLogin from './admin/AdminLogin';
import AdminLayout from './admin/AdminLayout';
import AdminDashboard from './admin/AdminDashboard';
import AdminUsers from './admin/AdminUsers';

function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/story" element={<StoryPage />} />
            <Route path="/objective" element={<ObjectivePage />} />
            <Route path="/contact" element={<ContactPage />} />
          </Route>
          <Route path="/admin" element={<AdminLogin />} />
          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  );
}

export default App;
