import { MapPin, Phone, Mail } from 'lucide-react';
import { useLang } from '../i18n/LanguageContext';

export default function Footer() {
  const { t } = useLang();
  const year = new Date().getFullYear();

  return (
    <footer className="bg-primary-dark text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img src="/cross.svg" alt="" className="w-8 h-8" />
              <span className="font-serif font-bold text-lg text-accent">
                Oromo Christian Church
              </span>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              {t.hero.subtitle}
            </p>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-serif font-semibold text-accent mb-4">{t.contact.title}</h3>
            <div className="space-y-3 text-sm text-gray-300">
              <div className="flex items-start gap-2">
                <MapPin size={16} className="mt-0.5 flex-shrink-0 text-accent" />
                <span>{t.contact.address}</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin size={16} className="mt-0.5 flex-shrink-0 text-accent" />
                <span>{t.contact.worshipAddress}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={16} className="flex-shrink-0 text-accent" />
                <span>{t.contact.phoneNumber}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={16} className="flex-shrink-0 text-accent" />
                <span>info@oromochurch-utrecht.nl</span>
              </div>
            </div>
          </div>

          {/* Service Times */}
          <div>
            <h3 className="font-serif font-semibold text-accent mb-4">{t.home.serviceDay}</h3>
            <div className="text-sm text-gray-300 space-y-2">
              <p>{t.home.serviceLocation}</p>
              <p className="text-accent font-medium">Sunday / Zondag</p>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 text-center text-sm text-gray-400">
          {t.footer.rights.replace('{year}', String(year))}
        </div>
      </div>
    </footer>
  );
}
