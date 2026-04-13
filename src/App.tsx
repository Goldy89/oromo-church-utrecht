import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './i18n/LanguageContext';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import StoryPage from './pages/StoryPage';
import ObjectivePage from './pages/ObjectivePage';
import ContactPage from './pages/ContactPage';

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
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  );
}

export default App;
