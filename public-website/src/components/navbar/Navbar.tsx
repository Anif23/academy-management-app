import { useState, useEffect } from 'react';
import { Menu, X, MessageSquare } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useAcademyInfo } from '../../hooks/useAcademyInfo';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { data: academy } = useAcademyInfo();
  const hasRootPathOrHash = true;

  const serverBaseUrl = import.meta.env.VITE_API_URL.replace('/api', '');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '/#home' },
    { name: 'About', href: '/#about' },
    { name: 'Courses', href: '/#courses' },
    { name: 'Learning', href: '/#learning' },
    { name: 'Testimonials', href: '/#testimonials' },
    { name: 'FAQ', href: '/#faq' },
    { name: 'Contact', href: '/#contact' },
  ];

  const logoUrl = academy?.logoUrl
    ? (/^https?:\/\//.test(academy.logoUrl) ? academy.logoUrl : `${serverBaseUrl}${academy.logoUrl}`)
    : null;
     
  return (
    <nav
      style={{ top: 'var(--ticker-h, 0px)' }}
      className={cn(
          'fixed left-0 right-0 z-50 transition-[top,background-color,box-shadow] duration-300 px-6 py-4',
          hasRootPathOrHash && !isScrolled
            ? 'bg-primary py-5'
            : isScrolled
              ? 'bg-white/80 backdrop-blur-md shadow-sm py-5'
              : 'bg-transparent py-5'
      )}
    >
      <div className="max-w-full mx-auto flex xl:px-12 items-center justify-between">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2" aria-label={`${academy?.name || 'Academy'} home`}>
          {logoUrl ? (
            <img src={logoUrl} alt={academy?.name} className={cn('w-14 h-14 object-contain rounded-lg transition-all duration-300', isScrolled ? "bg-transparent" : "bg-white" )} />
          ) : (
            <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center text-white font-bold text-xl">
              {academy?.name?.charAt(0) || 'A'}
            </div>
          )}
          <span className={cn(
            'text-2xl font-bold tracking-tight transition-colors',
             isScrolled ? 'text-primary' : 'text-white'
          )}>
            {academy?.name || 'AcademyPro'}
          </span>
        </a>

        {/* Desktop Navigation */}
        <div className="hidden xl:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className={cn('text-sm xl:text-base font-medium hover:text-accent transition-colors', isScrolled ? "text-secondary-dark" : "text-white")}
            >
              {link.name}
            </a>
          ))}
          <div className="flex items-center gap-4 ml-4">
            <a
              href="/register"
              className="px-5 py-2 btn-gradient text-white rounded-full text-sm font-semibold active:scale-95"
            >
              Register
            </a>
            <a
              href={`https://wa.me/${academy?.whatsapp || 'your-number'}`}
              target="_blank"
              rel="noopener noreferrer"
              className={cn('p-2 hover:text-accent transition-colors', isScrolled ? "text-primary" : "text-white")}
              title="Chat on WhatsApp"
              aria-label="Chat on WhatsApp"
            >
              <MessageSquare size={20} aria-hidden="true" />
            </a>
          </div>
        </div>

        {/* Mobile Toggle */}
        <button
          type="button"
          className={cn('xl:hidden p-2 text-primary', isScrolled ? "text-primary" : "bg-white rounded-lg")}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-menu"
        >
          {isMobileMenuOpen ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        id="mobile-menu"
        className={cn(
        'xl:hidden absolute top-full left-0 right-0 bg-white border-t transition-all duration-300 overflow-hidden',
        isMobileMenuOpen ? 'max-h-screen py-6 px-6 opacity-100' : 'max-h-0 opacity-0'
      )}>
        <div className="flex flex-col gap-4">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-lg font-medium text-secondary hover:text-accent transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.name}
            </a>
          ))}
          <hr className="my-2" />
          <div className="flex flex-col gap-3">
            <a
              href="/register"
              className="w-full py-3 bg-accent text-white text-center rounded-xl font-semibold"
            >
              Register Now
            </a>
            <a
              href={`https://wa.me/${academy?.whatsapp || 'your-number'}`}
              className="w-full py-3 border border-accent text-accent text-center rounded-xl font-semibold flex items-center justify-center gap-2"
            >
              <MessageSquare size={18} />
              Chat on WhatsApp
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
