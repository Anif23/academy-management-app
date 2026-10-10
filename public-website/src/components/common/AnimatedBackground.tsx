import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Global decorative background that reacts to scroll with a slow parallax
 * drift + subtle hue/scale shift. Purely visual (pointer-events: none),
 * sits behind all page content, and respects prefers-reduced-motion.
 */
const AnimatedBackground = () => {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
      if (mql.matches) return;

      const blobs = gsap.utils.toArray<HTMLElement>(".bg-blob");

      // Slow ambient drift, independent of scroll, so the page never feels static.
      blobs.forEach((blob, i) => {
        gsap.to(blob, {
          x: i % 2 === 0 ? 40 : -40,
          y: i % 2 === 0 ? -30 : 30,
          duration: 14 + i * 3,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
        });
      });

      // Scroll-linked parallax: each blob moves at a different speed/direction
      // as the user scrolls, giving the page depth without being distracting.
      blobs.forEach((blob, i) => {
        const speed = (i % 2 === 0 ? 1 : -1) * (0.15 + i * 0.05);
        gsap.to(blob, {
          yPercent: speed * 60,
          scrollTrigger: {
            trigger: document.body,
            start: "top top",
            end: "bottom bottom",
            scrub: 1,
          },
        });
      });
    },
    { scope: container },
  );

  return (
    <div
      ref={container}
      aria-hidden="true"
      className="fixed inset-0 -z-10 pointer-events-none overflow-hidden"
    >
      <div className="bg-blob absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/5 rounded-full blur-[120px]" />
      <div className="bg-blob absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
      <div className="bg-blob absolute top-[35%] right-[10%] w-[25%] h-[25%] bg-accent/[0.04] rounded-full blur-[100px]" />
    </div>
  );
};

export default AnimatedBackground;
