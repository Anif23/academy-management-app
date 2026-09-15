import { MessageCircle } from 'lucide-react';

interface WhatsAppButtonProps {
  text?: string;
}

const WhatsAppButton = ({ text = "Chat with us" }: WhatsAppButtonProps) => {
  const handleWhatsAppClick = () => {
    // In a real app, this would be dynamically updated based on current page
    const message = encodeURIComponent("Hi, I'm visiting the Academy website and would like more information.");
    window.open(`https://wa.me/your-number?text=${message}`, '_blank');
  };

  return (
    <button
      onClick={handleWhatsAppClick}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-all active:scale-95 group"
    >
      <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 ease-in-out font-bold text-sm">
        {text}
      </span>
      <div className="bg-white text-[#25D366] p-2 rounded-full">
        <MessageCircle size={24} fill="currentColor" />
      </div>
    </button>
  );
};

export default WhatsAppButton;
