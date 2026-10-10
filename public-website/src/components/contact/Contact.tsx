import { useEffect, useState } from 'react';
import { useAcademyInfo } from '../../hooks/useAcademyInfo';
import { MapPin, Mail, Phone, MessageSquare } from 'lucide-react';
import { getStoredConsent, saveConsent } from '../../utils/cookieConsent';

const Contact = () => {
  const { data: info, isLoading } = useAcademyInfo();
  const [mapConsent, setMapConsent] = useState(() => getStoredConsent()?.functional ?? false);

  useEffect(() => {
    const onChange = (e: Event) => setMapConsent(Boolean((e as CustomEvent).detail?.functional));
    window.addEventListener('cookie-consent-changed', onChange);
    return () => window.removeEventListener('cookie-consent-changed', onChange);
  }, []);

  if (isLoading) return <div className="py-24 bg-white text-center">Loading contact info...</div>;
  if (!info) return null;

  return (
    <section id="contact" className="py-24 bg-white overflow-hidden">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-4xl lg:text-5xl font-bold text-primary tracking-tight">
            Get In <span className="text-gradient">Touch</span>
          </h2>
          <p className="text-lg text-secondary leading-relaxed">
            Have questions about our courses or admissions? We're here to help you start your journey.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Contact Info */}
          <div className="space-y-8">
            <div className="grid gap-6 px-4">
              <a
                href={`tel:${info.phone}`}
                className="p-6 rounded-3xl bg-slate-50 border border-slate-100 flex items-start gap-6 hover:shadow-lg transition-all group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <div className="p-4 bg-accent/10 text-accent rounded-2xl group-hover:bg-accent group-hover:text-white transition-all">
                  <Phone size={24} />
                </div>
                <div>
                  <p className="text-sm text-secondary mb-1">Call Us</p>
                  <p className="text-xl font-bold text-primary">{info.phone}</p>
                </div>
              </a>

              <a
                href={`mailto:${info.email}`}
                className="p-6 rounded-3xl bg-slate-50 border border-slate-100 flex items-start gap-6 hover:shadow-lg transition-all group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <div className="p-4 bg-accent/10 text-accent rounded-2xl group-hover:bg-accent group-hover:text-white transition-all">
                  <Mail size={24} />
                </div>
                <div>
                  <p className="text-sm text-secondary mb-1">Email Us</p>
                  <p className="text-xl font-bold text-primary">{info.email}</p>
                </div>
              </a>

              <a
                href={`https://wa.me/${String(info.whatsapp || '').replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-6 rounded-3xl bg-slate-50 border border-slate-100 flex items-start gap-6 hover:shadow-lg transition-all group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <div className="p-4 bg-accent/10 text-accent rounded-2xl group-hover:bg-accent group-hover:text-white transition-all">
                  <MessageSquare size={24} />
                </div>
                <div>
                  <p className="text-sm text-secondary mb-1">WhatsApp</p>
                  <p className="text-xl font-bold text-primary">{info.whatsapp}</p>
                </div>
              </a>

              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(info.address + ' ' + info.city)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-6 rounded-3xl bg-slate-50 border border-slate-100 flex items-start gap-6 hover:shadow-lg transition-all group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <div className="p-4 bg-accent/10 text-accent rounded-2xl group-hover:bg-accent group-hover:text-white transition-all">
                  <MapPin size={24} />
                </div>
                <div>
                  <p className="text-sm text-secondary mb-1">Visit Us</p>
                  <p className="text-lg font-bold text-primary leading-tight">
                    {info.address}, {info.city}, {info.state}
                  </p>
                </div>
              </a>
            </div>
          </div>

          {/* Map / Visual */}
          <div className="relative h-[500px] rounded-3xl overflow-hidden shadow-2xl border-8 border-white group">
            {mapConsent ? (
              <iframe
                title="Academy location map"
                src={`https://maps.google.com/maps?q=${encodeURIComponent(info.address + ' ' + info.city)}&output=embed`}
                className="w-full h-full grayscale contrast-125 transition-all duration-500 group-hover:grayscale-0"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-3 bg-slate-100 p-8 text-center">
                <MapPin className="h-8 w-8 text-secondary" aria-hidden="true" />
                <p className="text-sm text-secondary">
                  The map is provided by Google and sets its own cookies once loaded.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    saveConsent({ functional: true, analytics: getStoredConsent()?.analytics ?? false });
                    setMapConsent(true);
                  }}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark"
                >
                  Load map
                </button>
              </div>
            )}
            <div className="absolute top-6 right-6">
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(info.address + ' ' + info.city)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-white text-primary rounded-full text-sm font-bold shadow-lg hover:bg-accent hover:text-white transition-all duration-300 flex items-center gap-2"
              >
                <MapPin size={16} />
                Get Directions
              </a>
            </div>
            <div className="absolute bottom-6 left-6 right-6 p-6 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-100">
              <p className="text-sm font-bold text-primary mb-1">Working Hours</p>
              <p className="text-secondary text-sm">{info.workingHours || 'Mon-Sat: 9:00 AM - 7:00 PM'}</p>
            </div>
          </div>
        </div>
    </section>
  );
};

export default Contact;
