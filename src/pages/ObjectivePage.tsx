import { Target, BookOpen, Handshake, GraduationCap, HeartHandshake } from 'lucide-react';
import { useLang } from '../i18n/LanguageContext';

export default function ObjectivePage() {
  const { t } = useLang();

  const objectives = [
    { icon: <BookOpen size={24} />, text: t.objective.p1 },
    { icon: <HeartHandshake size={24} />, text: t.objective.p2 },
    { icon: <GraduationCap size={24} />, text: t.objective.p3 },
    { icon: <Target size={24} />, text: t.objective.p4 },
    { icon: <Handshake size={24} />, text: t.objective.p5 },
  ];

  return (
    <div>
      {/* Page Header */}
      <section className="bg-gradient-to-br from-primary to-primary-light text-white py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Target size={48} className="mx-auto mb-6 text-accent" />
          <h1 className="font-serif text-4xl sm:text-5xl font-bold mb-4">{t.objective.title}</h1>
        </div>
      </section>

      {/* Objectives */}
      <section className="py-16 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            {objectives.map((obj, i) => (
              <div
                key={i}
                className="flex gap-5 bg-white rounded-2xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow border border-gray-100"
              >
                <div className="flex-shrink-0 w-12 h-12 bg-accent/20 rounded-xl flex items-center justify-center text-accent-dark">
                  {obj.icon}
                </div>
                <p className="text-gray-600 leading-relaxed pt-2">{obj.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
