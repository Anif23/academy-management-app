import { Mail, Phone, MapPin } from "lucide-react";
import { useAcademyInfo } from "../../hooks/useAcademyInfo";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";

const Footer = () => {
  const { data: academy } = useAcademyInfo();

  const currentYear = new Date().getFullYear();

  const serverBaseUrl = import.meta.env.VITE_API_URL.replace("/api", "");

  const footerLinks = {
    company: [
      { name: "About Us", href: "#about" },
      { name: "Courses", href: "#courses" },
      { name: "Learning Journey", href: "#learning" },
      { name: "FAQ", href: "#faq" },
    ],
    support: [
      { name: "Contact Us", href: "#contact" },
      { name: "Registration", href: "/register" },
      { name: "Privacy Policy", href: "#" },
      { name: "Terms of Service", href: "#" },
    ],
    socials: [
      { name: "Facebook", icon: FaFacebook, href: "#" },
      { name: "Twitter", icon: FaTwitter, href: "#" },
      { name: "Instagram", icon: FaInstagram, href: "#" },
      { name: "LinkedIn", icon: FaLinkedin, href: "#" },
    ],
  };

  const logoUrl = academy?.logoUrl
    ? `${serverBaseUrl}${academy.logoUrl}`
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
            <div className="flex gap-4">
              {footerLinks.socials.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="p-2 bg-white/10 rounded-full hover:bg-accent transition-all duration-300 group"
                  title={social.name}
                >
                  <social.icon
                    size={20}
                    className="group-hover:scale-110 transition-transform"
                  />
                </a>
              ))}
            </div>
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
                <Phone size={18} shrink-0 text-accent />
                <span>{academy?.phone}</span>
              </li>
              <li className="flex items-center gap-3 text-slate-300 text-sm">
                <Mail size={18} shrink-0 text-accent />
                <span>{academy?.email}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-400 text-sm">
          <p>
            © {currentYear} {academy?.name || "AcademyPro"}. All rights
            reserved.
          </p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
