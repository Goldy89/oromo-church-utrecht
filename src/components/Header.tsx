import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Globe, ChevronDown } from 'lucide-react';
import { useLang, langLabels } from '../i18n/LanguageContext';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [langDropdown, setLangDropdown] = useState(false);
  const { t, lang, setLang } = useLang();
  const location = useLocation();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const navLinks = [
    { to: '/', label: t.nav.home },
    { to: '/story', label: t.nav.story },
    { to: '/objective', label: t.nav.objective },
    { to: '/contact', label: t.nav.contact },
  ];

  const isActive = (path: string) => location.pathname === path;

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setLangDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const langs = Object.entries(langLabels) as [typeof lang, string][];

  return (
    <header className="bg-white/95 backdrop-blur-sm shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 no-underline">
            <img src="/cross.svg" alt="" className="w-10 h-10" />
            <div className="hidden sm:block">
              <span className="text-primary font-serif font-bold text-lg leading-tight block">
                Oromo Christian Church
              </span>
              <span className="text-primary-light text-xs tracking-wider uppercase">Utrecht</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors no-underline ${
                  isActive(link.to)
                    ? 'bg-primary text-white'
                    : 'text-gray-600 hover:text-primary hover:bg-primary/5'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="relative ml-3" ref={dropdownRef}>
              <button
                onClick={() => setLangDropdown(!langDropdown)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-500 hover:text-primary hover:bg-primary/5 transition-colors border-none bg-transparent cursor-pointer"
              >
                <Globe size={16} />
                {langLabels[lang]}
                <ChevronDown size={14} />
              </button>
              {langDropdown && (
                <div className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50">
                  {langs.map(([code, label]) => (
                    <button
                      key={code}
                      onClick={() => { setLang(code); setLangDropdown(false); }}
                      className={`w-full text-left px-4 py-2 text-sm transition-colors border-none cursor-pointer ${
                        code === lang
                          ? 'bg-primary/10 text-primary font-semibold'
                          : 'text-gray-600 hover:bg-gray-50 bg-transparent'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 border-none bg-transparent cursor-pointer"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg">
          <nav className="flex flex-col px-4 py-3 gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className={`px-4 py-3 rounded-lg text-sm font-medium no-underline ${
                  isActive(link.to)
                    ? 'bg-primary text-white'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="border-t border-gray-100 mt-1 pt-1">
              <p className="px-4 py-1 text-xs text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <Globe size={14} />
                {t.nav.switchLang}
              </p>
              {langs.map(([code, label]) => (
                <button
                  key={code}
                  onClick={() => { setLang(code); setMenuOpen(false); }}
                  className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors border-none cursor-pointer ${
                    code === lang
                      ? 'bg-primary/10 text-primary font-semibold'
                      : 'text-gray-600 hover:bg-gray-50 bg-transparent'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
