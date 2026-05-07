"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  children: React.ReactNode;
  className?: string;
  delay?: 0 | 1 | 2 | 3;
}

export default function ScrollReveal({ children, className = "", delay = 0 }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.08, rootMargin: "0px 0px -50px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const delayClass = delay > 0 ? `scroll-reveal-delay-${delay}` : "";

  return (
    <div
      ref={ref}
      className={`scroll-reveal ${visible ? "revealed" : ""} ${delayClass} ${className}`}
    >
      {children}
    </div>
  );
}
