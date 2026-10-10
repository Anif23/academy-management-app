import { useRef } from "react";
import { Mail, Phone, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useAcademyInfo } from "../../hooks/useAcademyInfo";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";

gsap.registerPlugin(ScrollTrigger);

const Footer = () => {
  const { data: academy } = useAcademyInfo();
  const socialsRef = useRef<HTMLDivElement>(null);

  const currentYear = new Date().getFullYear();

  const serverBaseUrl = import.meta.env.VITE_API_URL.replace("/api", "");

  const socials = [
    { name: 'Facebook', icon: FaFacebook, href: academy?.facebookUrl, hover: 'hover:bg-[#1877F2]' },
    { name: 'Twitter', icon: FaTwitter, href: academy?.twitterUrl, hover: 'hover:bg-black' },
    { name: 'Instagram', icon: FaInstagram, href: academy?.instagramUrl, hover: 'hover:bg-gradient-to-tr hover:from-[#f09433] hover:via-[#e6683c] hover:to-[#bc1888]' },
    { name: 'LinkedIn', icon: FaLinkedin, href: academy?.linkedinUrl, hover: 'hover:bg-[#0A66C2]' },
  ].filter((social): social is typeof social & { href: string } => Boolean(social.href));

  useGSAP(
    () => {
      const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
      if (mql.matches || socials.length === 0 || !socialsRef.current?.querySelector('.social-icon')) return;

      gsap.fromTo(
        '.social-icon',
        { opacity: 0, scale: 0.4, y: 12 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.08,
          ease: 'back.out(2.5)',
          scrollTrigger: { trigger: socialsRef.current, start: 'top 95%' },
        },
      );
    },
    { scope: socialsRef, dependencies: [socials.length] },
  );

  const footerLinks = {
    company: [
      { name: "About Us", href: "/#about" },
      { name: "Courses", href: "/#courses" },
      { name: "Learning Journey", href: "/#learning" },
      { name: "FAQ", href: "/#faq" },
    ],
    support: [
      { name: "Contact Us", href: "/#contact" },
      { name: "Registration", href: "/register" },
    ],
  };

  const legalLinks = [
    { name: "Privacy Policy", href: "/privacy-policy" },
    { name: "Terms & Conditions", href: "/terms" },
    { name: "Cookie Policy", href: "/cookie-policy" },
    { name: "Refund Policy", href: "/refund-policy" },
  ];

  const logoUrl = academy?.logoUrl
    ? (/^https?:\/\//.test(academy.logoUrl) ? academy.logoUrl : `${serverBaseUrl}${academy.logoUrl}`)
    : null;

  return (
    <footer className="bg-primary text-white pt-20 pb-10">
      <div className="max-w-full mx-auto px-6 sm:px-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Academy Info */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={academy?.name}
                  className="w-14 h-14 object-contain rounded-lg transition-all duration-300"
                />
              ) : (
                <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center text-white font-bold text-xl">
                  {academy?.name?.charAt(0) || "A"}
                </div>
              )}
              <span className="text-2xl font-bold tracking-tight">
                {academy?.name || "AcademyPro"}
              </span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              {academy?.description?.split(".")[0] ||
                "Empowering students with industry-leading education and specialized training to excel in their careers."}
            </p>
            {(academy?.legalName || academy?.registrationNumber) && (
              <p className="text-xs text-slate-400">
                {academy?.legalName}
                {academy?.legalName && academy?.registrationNumber ? " · " : ""}
                {academy?.registrationNumber && `Reg. No. ${academy.registrationNumber}`}
              </p>
            )}
            {socials.length > 0 && (
              <div ref={socialsRef} className="flex gap-4">
                {socials.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`social-icon p-2.5 bg-white/10 rounded-full transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-110 hover:shadow-lg group ${social.hover}`}
                    title={social.name}
                    aria-label={`${academy?.name || 'Academy'} on ${social.name}`}
                  >
                    <social.icon
                      size={20}
                      className="transition-transform duration-300 group-hover:rotate-[360deg]"
                    />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold mb-6">Company</h4>
            <ul className="space-y-4">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-slate-300 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="text-lg font-bold mb-6">Support</h4>
            <ul className="space-y-4">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-slate-300 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
              {legalLinks.map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="text-slate-300 hover:text-white transition-colors text-sm">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-bold mb-6">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-slate-300 text-sm">
                <MapPin size={18} className="mt-0.5 shrink-0 text-accent" />
                <span>
                  {academy?.address}, {academy?.city}, {academy?.state}
                </span>
              </li>
              <li className="flex items-center gap-3 text-slate-300 text-sm">
                <Phone size={18} className="shrink-0 text-accent" />
                <span>{academy?.phone}</span>
              </li>
              <li className="flex items-center gap-3 text-slate-300 text-sm">
                <Mail size={18} className="shrink-0 text-accent" />
                <span>{academy?.email}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-400 text-sm">
          <p>
            © {currentYear} {academy?.legalName || academy?.name || "AcademyPro"}. All rights
            reserved.
          </p>
          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event("open-cookie-preferences"))}
            className="hover:text-white transition-colors underline-offset-2 hover:underline"
          >
            Manage cookie preferences
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
