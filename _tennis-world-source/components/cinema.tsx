'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';

export function Reveal({ children, className = '', delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = ref.current;
    if (!element || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      element.animate([{ opacity: 0, transform: 'translateY(32px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 1100, delay, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'backwards' });
      observer.disconnect();
    }, { threshold: 0.08 });
    observer.observe(element);
    return () => observer.disconnect();
  }, [delay]);
  return <div ref={ref} className={className}>{children}</div>;
}

export function Cinema() {
  const video = useRef<HTMLVideoElement>(null);
  const container = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const [userPaused, setUserPaused] = useState(false);

  useEffect(() => {
    const element = video.current;
    if (!element) return;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let inView = true;
    const sync = () => {
      if (!inView || document.hidden || motion.matches || userPaused) element.pause();
      else void element.play().catch(() => setPlaying(false));
    };
    const observer = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; sync(); }, { threshold: .08 });
    if (container.current) observer.observe(container.current);
    document.addEventListener('visibilitychange', sync);
    motion.addEventListener('change', sync);
    sync();
    return () => { observer.disconnect(); document.removeEventListener('visibilitychange', sync); motion.removeEventListener('change', sync); element.pause(); };
  }, [userPaused]);

  function toggle() {
    const element = video.current;
    if (!element) return;
    if (!element.paused) { setUserPaused(true); element.pause(); }
    else { setUserPaused(false); void element.play().catch(() => setUnavailable(true)); }
  }

  return <div className="cinema" ref={container}>
    <img src="/films/scene-1-poster.jpg" className="cinema-poster" alt="A pink claw machine inside a sunlit marble gallery, surrounded by playful chrome and yellow sculptures" width="1924" height="1076" fetchPriority="high" />
    <video ref={video} className={`cinema-video ${ready && !unavailable ? 'is-playing' : ''}`} muted loop playsInline preload="metadata" poster="/films/scene-1-poster.jpg" aria-hidden="true" onLoadedData={() => setReady(true)} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onError={() => setUnavailable(true)}>
      <source src="/films/nancy-entrance-mobile.mp4" type="video/mp4" media="(max-width: 767px)" />
      <source src="/films/nancy-entrance.mp4" type="video/mp4" />
    </video>
    <div className="cinema-shade" />
    <div className="hero-topline"><span>The art of feeling good.</span><span>Welcome to the world of Nancy</span></div>
    <div className="hero-content">
      <h1><span>For the</span><em>pleasure of it.</em></h1>
      <div className="hero-aside"><p>A world of beautiful things.<br />And even better feelings.</p><a href="#playground" className="round-cta"><span>Find your<br />pleasure</span><span aria-hidden="true">↗</span></a></div>
    </div>
    <div className="hero-baseline"><a href="#invitation">Let curiosity lead <span aria-hidden="true">↓</span></a><span>01 / A world of possibility</span><Button variant="ghost" className="film-control" onClick={toggle} disabled={unavailable} aria-label={playing ? 'Pause background film' : 'Play background film'}>{unavailable ? 'Still mode' : playing ? 'Pause motion' : 'Play motion'}<span aria-hidden="true">{playing ? 'Ⅱ' : '▷'}</span></Button></div>
  </div>;
}
