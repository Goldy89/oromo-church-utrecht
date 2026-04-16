import { useState, useEffect, useCallback } from 'react';
import { Save, Loader2, CheckCircle, AlertCircle, Globe } from 'lucide-react';
import { getContent, saveContent, type ContentData } from './api';

const LANGS = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'nl', label: 'Dutch', flag: '🇳🇱' },
  { code: 'om', label: 'Oromo', flag: '🇪🇹' },
];

const SECTIONS = [
  { key: 'nav', label: 'Navigation' },
  { key: 'hero', label: 'Hero Section' },
  { key: 'home', label: 'Home Page' },
  { key: 'story', label: 'Our Story' },
  { key: 'objective', label: 'Objectives' },
  { key: 'contact', label: 'Contact' },
  { key: 'footer', label: 'Footer' },
];

const FIELD_LABELS: Record<string, string> = {
  'nav.home': 'Home Link',
  'nav.story': 'Story Link',
  'nav.objective': 'Objective Link',
  'nav.contact': 'Contact Link',
  'nav.switchLang': 'Language Label',
  'hero.title': 'Title',
  'hero.subtitle': 'Subtitle',
  'hero.cta': 'Call to Action Button',
  'hero.learnMore': 'Learn More Button',
  'home.welcomeTitle': 'Welcome Title',
  'home.welcomeText': 'Welcome Text',
  'home.worshipTitle': 'Worship Title',
  'home.worshipText': 'Worship Text',
  'home.communityTitle': 'Community Title',
  'home.communityText': 'Community Text',
  'home.serviceDay': 'Service Day',
  'home.serviceLocation': 'Service Location',
  'story.title': 'Title',
  'story.subtitle': 'Subtitle',
  'story.p1': 'Paragraph 1',
  'story.p2': 'Paragraph 2',
  'story.p3': 'Paragraph 3',
  'story.adminTitle': 'Admin Section Title',
  'story.admin1': 'Admin Member 1',
  'story.admin2': 'Admin Member 2',
  'story.admin3': 'Admin Member 3',
  'objective.title': 'Title',
  'objective.p1': 'Paragraph 1',
  'objective.p2': 'Paragraph 2',
  'objective.p3': 'Paragraph 3',
  'objective.p4': 'Paragraph 4',
  'objective.p5': 'Paragraph 5',
  'contact.title': 'Title',
  'contact.churchAddress': 'Church Address Label',
  'contact.address': 'Address',
  'contact.worshipPlace': 'Worship Place Label',
  'contact.worshipAddress': 'Worship Address',
  'contact.phone': 'Phone Label',
  'contact.phoneNumber': 'Phone Number',
  'contact.email': 'Email Label',
  'contact.formTitle': 'Form Title',
  'contact.name': 'Name Field Label',
  'contact.emailField': 'Email Field Label',
  'contact.subject': 'Subject Label',
  'contact.attachment': 'Attachment Label',
  'contact.message': 'Message Label',
  'contact.send': 'Send Button',
  'contact.chooseFile': 'Choose File Label',
  'contact.noFile': 'No File Label',
  'footer.rights': 'Copyright Text',
  'footer.address': 'Footer Address',
};

function isLongText(key: string): boolean {
  return key.includes('Text') || key.includes('subtitle') || key.startsWith('p') || key === 'rights';
}

export default function AdminDashboard() {
  const [content, setContent] = useState<Record<string, ContentData> | null>(null);
  const [activeSection, setActiveSection] = useState('nav');
  const [activeLang, setActiveLang] = useState('en');
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [loading, setLoading] = useState(true);

  const loadContent = useCallback(async () => {
    try {
      const data = await getContent();
      setContent(data);
    } catch (err) {
      setStatus({ type: 'error', message: err instanceof Error ? err.message : 'Failed to load content' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadContent(); }, [loadContent]);

  const handleFieldChange = (lang: string, section: string, field: string, value: string) => {
    if (!content) return;
    setContent({
      ...content,
      [lang]: {
        ...content[lang],
        [section]: {
          ...(content[lang]?.[section] || {}),
          [field]: value,
        },
      },
    });
  };

  const handleSave = async () => {
    if (!content) return;
    setSaving(true);
    setStatus(null);
    try {
      await saveContent(content);
      setStatus({ type: 'success', message: 'Content saved successfully! Changes are live.' });
      setTimeout(() => setStatus(null), 4000);
    } catch (err) {
      setStatus({ type: 'error', message: err instanceof Error ? err.message : 'Failed to save' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  if (!content) {
    return (
      <div className="p-8 text-center text-red-600">
        <AlertCircle size={48} className="mx-auto mb-4" />
        <p>Failed to load content. Please refresh.</p>
      </div>
    );
  }

  const sectionData = content[activeLang]?.[activeSection] || {};

  return (
    <div>
      {/* Status Bar */}
      {status && (
        <div className={`mb-6 p-3 rounded-xl flex items-center gap-2 text-sm ${
          status.type === 'success'
            ? 'bg-green-50 border border-green-200 text-green-700'
            : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          {status.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {status.message}
        </div>
      )}

      {/* Language Tabs */}
      <div className="flex items-center gap-2 mb-6">
        <Globe size={18} className="text-gray-400" />
        {LANGS.map((lang) => (
          <button
            key={lang.code}
            onClick={() => setActiveLang(lang.code)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer border-none ${
              activeLang === lang.code
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {lang.flag} {lang.label}
          </button>
        ))}
      </div>

      <div className="flex gap-6">
        {/* Section Sidebar */}
        <div className="w-48 shrink-0">
          <nav className="space-y-1">
            {SECTIONS.map((section) => (
              <button
                key={section.key}
                onClick={() => setActiveSection(section.key)}
                className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer border-none ${
                  activeSection === section.key
                    ? 'bg-primary/10 text-primary'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {section.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content Editor */}
        <div className="flex-1 min-w-0">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-serif text-xl font-bold text-primary mb-6">
              {SECTIONS.find((s) => s.key === activeSection)?.label} — {LANGS.find((l) => l.code === activeLang)?.label}
            </h2>
            <div className="space-y-5">
              {Object.entries(sectionData).map(([field, value]) => {
                const labelKey = `${activeSection}.${field}`;
                const label = FIELD_LABELS[labelKey] || field;
                const long = isLongText(field);
                return (
                  <div key={field}>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
                    {long ? (
                      <textarea
                        value={value}
                        onChange={(e) => handleFieldChange(activeLang, activeSection, field, e.target.value)}
                        rows={4}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm resize-y"
                      />
                    ) : (
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => handleFieldChange(activeLang, activeSection, field, e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="mt-8 flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-primary hover:bg-primary-light disabled:opacity-50 text-white font-semibold px-8 py-3.5 rounded-xl transition-colors flex items-center gap-2 cursor-pointer border-none text-sm"
        >
          {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          {saving ? 'Saving...' : 'Save All Changes'}
        </button>
      </div>
    </div>
  );
}
