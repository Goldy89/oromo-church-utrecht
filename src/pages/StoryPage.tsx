import { BookOpen, Users } from 'lucide-react';
import { useLang } from '../i18n/LanguageContext';

export default function StoryPage() {
  const { t } = useLang();

  return (
    <div>
      {/* Page Header */}
      <section className="bg-gradient-to-br from-primary to-primary-light text-white py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <BookOpen size={48} className="mx-auto mb-6 text-accent" />
          <h1 className="font-serif text-4xl sm:text-5xl font-bold mb-4">{t.story.title}</h1>
          <p className="text-white/70 text-lg">{t.story.subtitle}</p>
        </div>
      </section>

      {/* Story Content */}
      <section className="py-16 sm:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            <div className="bg-warm rounded-2xl p-8 border-l-4 border-accent">
              <p className="text-gray-700 leading-relaxed text-lg">{t.story.p1}</p>
            </div>
            <p className="text-gray-600 leading-relaxed text-lg">{t.story.p2}</p>
            <p className="text-gray-600 leading-relaxed text-lg">{t.story.p3}</p>
          </div>

          {/* Administration */}
          <div className="mt-16 bg-white rounded-2xl p-8 shadow-md border border-gray-100">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <Users size={24} className="text-primary" />
              </div>
              <h2 className="font-serif text-2xl font-bold text-primary">{t.story.adminTitle}</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[t.story.admin1, t.story.admin2, t.story.admin3].map((admin, i) => {
                const [name, role] = admin.split(' — ');
                return (
                  <div key={i} className="text-center p-4 rounded-xl bg-warm">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-primary font-bold text-lg">{name.charAt(0)}</span>
                    </div>
                    <h3 className="font-semibold text-primary text-sm">{name}</h3>
                    <p className="text-gray-500 text-xs mt-1">{role}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
