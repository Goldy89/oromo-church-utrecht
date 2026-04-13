import { useState, useRef, type FormEvent } from 'react';
import { MapPin, Phone, Mail, Send, Paperclip } from 'lucide-react';
import { useLang } from '../i18n/LanguageContext';

export default function ContactPage() {
  const { t } = useLang();
  const fileRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    alert('Message submitted! (Backend integration needed for actual sending)');
  };

  return (
    <div>
      {/* Page Header */}
      <section className="bg-gradient-to-br from-primary to-primary-light text-white py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Mail size={48} className="mx-auto mb-6 text-accent" />
          <h1 className="font-serif text-4xl sm:text-5xl font-bold mb-4">{t.contact.title}</h1>
        </div>
      </section>

      <section className="py-16 sm:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
            {/* Contact Info */}
            <div className="lg:col-span-2 space-y-8">
              {/* Church Address */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-serif font-semibold text-primary mb-4 flex items-center gap-2">
                  <MapPin size={20} className="text-accent-dark" />
                  {t.contact.churchAddress}
                </h3>
                <p className="text-gray-600 text-sm">{t.contact.address}</p>
              </div>

              {/* Worship Place */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-serif font-semibold text-primary mb-4 flex items-center gap-2">
                  <MapPin size={20} className="text-accent-dark" />
                  {t.contact.worshipPlace}
                </h3>
                <p className="text-gray-600 text-sm">{t.contact.worshipAddress}</p>
              </div>

              {/* Phone & Email */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
                <div className="flex items-center gap-3">
                  <Phone size={18} className="text-accent-dark" />
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider">{t.contact.phone}</p>
                    <a href={`tel:${t.contact.phoneNumber}`} className="text-primary font-medium no-underline hover:underline">
                      {t.contact.phoneNumber}
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail size={18} className="text-accent-dark" />
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider">{t.contact.email}</p>
                    <a href="mailto:info@oromochurch-utrecht.nl" className="text-primary font-medium no-underline hover:underline">
                      info@oromochurch-utrecht.nl
                    </a>
                  </div>
                </div>
              </div>

              {/* Map embed */}
              <div className="rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                <iframe
                  title="Church location"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2451.5!2d5.0919!3d52.0907!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNTLCsDA1JzI2LjUiTiA1wrAwNSczMC44IkU!5e0!3m2!1sen!2snl!4v1"
                  width="100%"
                  height="200"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-2xl p-8 shadow-md border border-gray-100">
                <h2 className="font-serif text-2xl font-bold text-primary mb-8">{t.contact.formTitle}</h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">{t.contact.name}</label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">{t.contact.emailField}</label>
                    <input
                      type="email"
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">{t.contact.subject}</label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">{t.contact.attachment}</label>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => fileRef.current?.click()}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors bg-white cursor-pointer"
                      >
                        <Paperclip size={16} />
                        {t.contact.chooseFile}
                      </button>
                      <span className="text-sm text-gray-400">{fileName || t.contact.noFile}</span>
                      <input
                        ref={fileRef}
                        type="file"
                        className="hidden"
                        onChange={(e) => setFileName(e.target.files?.[0]?.name || '')}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">{t.contact.message}</label>
                    <textarea
                      rows={5}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary-light text-white font-semibold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer border-none text-sm"
                  >
                    <Send size={18} />
                    {t.contact.send}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
