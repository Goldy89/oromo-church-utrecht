import { Link } from 'react-router-dom';
import { Heart, Users, Music, ChevronRight, MapPin, Clock } from 'lucide-react';
import { useLang } from '../i18n/LanguageContext';

export default function HomePage() {
  const { t } = useLang();

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary via-primary-light to-primary-dark text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyem0wLTMwVjZIMjR2LTJoMTJ6TTI0IDI0aDEydjJIMjR2LTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 lg:py-40 relative">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              {t.hero.title}
            </h1>
            <p className="text-lg sm:text-xl text-white/80 mb-10 leading-relaxed max-w-2xl mx-auto">
              {t.hero.subtitle}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/contact"
                className="bg-accent hover:bg-accent-dark text-primary-dark font-semibold px-8 py-3.5 rounded-full transition-all shadow-lg hover:shadow-xl no-underline inline-flex items-center gap-2"
              >
                {t.hero.cta}
                <ChevronRight size={18} />
              </Link>
              <Link
                to="/story"
                className="border-2 border-white/30 hover:border-white/60 text-white font-medium px-8 py-3.5 rounded-full transition-all no-underline hover:bg-white/10"
              >
                {t.hero.learnMore}
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent" />
      </section>

      {/* Service Info Banner */}
      <section className="bg-warm border-b border-accent/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-primary">
            <div className="flex items-center gap-2">
              <Clock size={20} className="text-accent-dark" />
              <span className="font-medium">{t.home.serviceDay}</span>
            </div>
            <div className="hidden sm:block w-1.5 h-1.5 rounded-full bg-accent-dark" />
            <div className="flex items-center gap-2">
              <MapPin size={20} className="text-accent-dark" />
              <span>{t.home.serviceLocation}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Welcome Section */}
      <section className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-primary mb-6">
              {t.home.welcomeTitle}
            </h2>
            <p className="text-gray-600 leading-relaxed text-lg">
              {t.home.welcomeText}
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-md hover:shadow-lg transition-shadow border border-gray-100 text-center">
              <div className="w-14 h-14 bg-accent/20 rounded-xl flex items-center justify-center mx-auto mb-5">
                <Music size={28} className="text-accent-dark" />
              </div>
              <h3 className="font-serif text-xl font-semibold text-primary mb-3">{t.home.worshipTitle}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{t.home.worshipText}</p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-md hover:shadow-lg transition-shadow border border-gray-100 text-center">
              <div className="w-14 h-14 bg-accent/20 rounded-xl flex items-center justify-center mx-auto mb-5">
                <Users size={28} className="text-accent-dark" />
              </div>
              <h3 className="font-serif text-xl font-semibold text-primary mb-3">{t.home.communityTitle}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{t.home.communityText}</p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-md hover:shadow-lg transition-shadow border border-gray-100 text-center">
              <div className="w-14 h-14 bg-accent/20 rounded-xl flex items-center justify-center mx-auto mb-5">
                <Heart size={28} className="text-accent-dark" />
              </div>
              <h3 className="font-serif text-xl font-semibold text-primary mb-3">{t.objective.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{t.objective.p4}</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white mb-4">
            {t.hero.cta}
          </h2>
          <p className="text-white/70 mb-8 text-lg">{t.home.serviceLocation}</p>
          <Link
            to="/contact"
            className="bg-accent hover:bg-accent-dark text-primary-dark font-semibold px-8 py-3.5 rounded-full transition-all shadow-lg hover:shadow-xl no-underline inline-flex items-center gap-2"
          >
            {t.contact.title}
            <ChevronRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
}
