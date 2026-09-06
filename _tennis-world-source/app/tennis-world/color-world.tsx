'use client';
/* oxlint-disable next/no-img-element -- Local artwork has explicit dimensions and lazy loading; this preview has no Next image optimizer. */

import { useEffect, useRef, useState, type CSSProperties, type MouseEvent } from 'react';
import { LivingCourt } from './living-court';
import { ArrivalReplay } from './tennis-arrival';
import './color-world.css';

const courts = [
  { id: 'daydream', name: 'Pink daydream', color: '#f38caf' },
  { id: 'electric', name: 'Electric blue', color: '#2549f0' },
  { id: 'original', name: 'Club green', color: '#173f35' },
] as const;

export function ColorCourt() {
  const [scene, setScene] = useState<typeof courts[number]['id']>('daydream');
  return <div className={`color-opening color-${scene}`}>
    <LivingCourt key={scene} scene={scene} />
    <ArrivalReplay />
    <div className="color-selector" aria-label="Change the color of the court">
      <span>Pick your atmosphere</span>
      <div>{courts.map(court => <button key={court.id} type="button" aria-label={court.name} aria-pressed={scene === court.id} onClick={() => setScene(court.id)} style={{ '--swatch': court.color } as CSSProperties}><i aria-hidden="true" /><span>{court.name}</span></button>)}</div>
    </div>
  </div>;
}

export function KineticRibbon() {
  const root = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => element.classList.toggle('is-visible', entry.isIntersecting));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return <div ref={root} className={`color-ribbons ${paused ? 'is-paused' : ''}`}>
    <p className="sr-only">Love all. Pleasure is the point.</p>
    <div className="color-ribbon ribbon-one" aria-hidden="true"><div>{[0, 1, 2, 3].map(i => <span key={i}>LOVE ALL <b>✳</b> PLAY MORE <b>✳</b> </span>)}</div></div>
    <div className="color-ribbon ribbon-two" aria-hidden="true"><div>{[0, 1, 2, 3].map(i => <span key={i}>PLEASURE IS THE POINT <b>↗</b> </span>)}</div></div>
    <button type="button" className="ribbon-pause" aria-label={paused ? 'Play moving lettering' : 'Pause moving lettering'} onClick={() => setPaused(!paused)}>{paused ? 'Play lettering ▷' : 'Pause lettering Ⅱ'}</button>
  </div>;
}

export function ScrollPortal() {
  const root = useRef<HTMLElement>(null);
  const [still, setStill] = useState(false);
  useEffect(() => {
    const section = root.current;
    if (!section) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    let visible = false;
    const draw = () => {
      frame = 0;
      if (!visible) return;
      const rect = section.getBoundingClientRect();
      const progress = Math.max(0, Math.min(1, -rect.top / Math.max(1, rect.height - window.innerHeight)));
      section.style.setProperty('--journey', String(still || reduced.matches ? .15 : progress));
    };
    const schedule = () => { if (!frame && visible) frame = requestAnimationFrame(draw); };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; schedule(); });
    observer.observe(section);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    reduced.addEventListener('change', schedule);
    return () => { observer.disconnect(); cancelAnimationFrame(frame); window.removeEventListener('scroll', schedule); window.removeEventListener('resize', schedule); reduced.removeEventListener('change', schedule); };
  }, [still]);
  return <section ref={root} className="color-portal" aria-labelledby="portal-title">
    <div className="portal-sticky">
      <div className="portal-top"><span>THE PLEASURE PRINCIPLE / 01</span><button type="button" aria-pressed={still} onClick={() => setStill(!still)}>{still ? 'Allow scroll motion ↗' : 'Still view Ⅱ'}</button></div>
      <div className="portal-aperture" aria-hidden="true"><img src="/tennis-world/contact.png" alt="" loading="lazy" width="1536" height="1024" /></div>
      <h2 id="portal-title"><span>GET</span><em>a little</em><span>CLOSER<span className="portal-period">.</span></span></h2>
      <div className="portal-bottom"><span>No performance.<br />Just presence.</span><p>Some things are<br /><em>better felt.</em></p><span className="portal-scroll">Keep going ↓</span></div>
      <div className="portal-orbit" aria-hidden="true"><span>FEEL GOOD</span><span>PLAY OFTEN</span></div>
    </div>
  </section>;
}

type Ball = { x: number; y: number; vx: number; vy: number; angle: number };

export function RallyCourt() {
  const court = useRef<HTMLButtonElement>(null);
  const ball = useRef<HTMLSpanElement>(null);
  const physics = useRef<Ball>({ x: .5, y: .5, vx: 0, vy: 0, angle: 0 });
  const launch = useRef<(() => void) | null>(null);
  const [hits, setHits] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hue, setHue] = useState(false);
  const phrases = ['A little less competition.', 'Beautifully unnecessary.', 'That’s the spirit.', 'Perfect form. Probably.', 'Keep the good feeling going.'];
  useEffect(() => {
    const field = court.current;
    const sphere = ball.current;
    if (!field || !sphere) return;
    let frame = 0;
    let last = 0;
    let visible = false;
    let width = field.clientWidth;
    let height = field.clientHeight;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const paint = () => {
      const p = physics.current;
      sphere.style.transform = `translate3d(${p.x * (width - 68)}px,${p.y * (height - 68)}px,0) rotate(${p.angle}deg)`;
    };
    const tick = (time: number) => {
      frame = 0;
      if (!visible || paused || document.hidden || reduced.matches) { last = 0; paint(); return; }
      const dt = Math.min((time - (last || time)) / 1000, .032);
      last = time;
      const p = physics.current;
      p.vy += .55 * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.angle += p.vx * dt * 140;
      if (p.x <= 0 || p.x >= 1) { p.x = Math.max(0, Math.min(1, p.x)); p.vx *= -.97; }
      if (p.y <= 0 || p.y >= 1) { p.y = Math.max(0, Math.min(1, p.y)); p.vy *= -.86; }
      paint();
      if (Math.abs(p.vy) > .025 || p.y < .995) frame = requestAnimationFrame(tick);
      else last = 0;
    };
    const start = () => { if (!frame) frame = requestAnimationFrame(tick); };
    launch.current = start;
    const resize = new ResizeObserver(() => { width = field.clientWidth; height = field.clientHeight; paint(); });
    resize.observe(field);
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible && (physics.current.vx || physics.current.vy)) start(); else paint(); });
    observer.observe(field);
    document.addEventListener('visibilitychange', start);
    reduced.addEventListener('change', start);
    paint();
    return () => { cancelAnimationFrame(frame); resize.disconnect(); observer.disconnect(); document.removeEventListener('visibilitychange', start); reduced.removeEventListener('change', start); launch.current = null; };
  }, [paused]);
  function serve(event: MouseEvent<HTMLButtonElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.detail === 0 ? (hits % 2 ? .7 : .3) : Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
    const y = event.detail === 0 ? .4 : Math.max(.1, Math.min(.85, (event.clientY - rect.top) / rect.height));
    const p = physics.current;
    p.vx = (x - p.x) * 1.8 || (hits % 2 ? -.48 : .48);
    p.vy = -.8;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { p.x = x; p.y = y; }
    setHits(count => count + 1);
    if (paused) setPaused(false);
    launch.current?.();
  }
  return <section className={`rally-section ${hue ? 'rally-alt' : ''}`} id="play-court" aria-labelledby="rally-title">
    <div className="rally-head"><span>THE REC ROOM / NO TALENT REQUIRED</span><button type="button" onClick={() => setHue(!hue)} aria-pressed={hue}>Switch the mood <i aria-hidden="true" /></button></div>
    <div className="rally-title"><h2 id="rally-title">MAKE A LITTLE<br /><em>racket.</em></h2><p>No winners. No losers.<br /> Just an excellent use<br /> of absolutely no time.</p></div>
    <div className="rally-frame">
      <button ref={court} className="rally-court" type="button" onClick={serve} aria-label="Serve a tennis ball. Click the court or press Enter or Space.">
        <span className="rally-lines" aria-hidden="true"><i /><i /><i /><i /></span>
        <span className="rally-watermark" aria-hidden="true">LOVE<br /><em>all.</em></span>
        <span ref={ball} className="rally-ball" aria-hidden="true"><i /><i /></span>
        <span className="rally-instruction">{hits ? 'Again? Anywhere you like.' : 'Tap anywhere to serve ↗'}</span>
      </button>
      <div className="rally-score"><span>GOOD FEELINGS</span><strong aria-live="polite" aria-atomic="true">{String(hits).padStart(2, '0')}</strong><span>PRESSURE TO WIN</span><strong>00</strong><span className="rally-score-flower" aria-hidden="true">✳</span><button type="button" onClick={() => setPaused(!paused)} aria-label={paused ? 'Resume the rally' : 'Pause the rally'}>{paused ? 'Resume ▷' : 'Pause Ⅱ'}</button></div>
    </div>
    <div className="rally-footer"><p aria-live="polite">{phrases[Math.min(hits, phrases.length - 1)]}</p><span>Mouse, touch, or spacebar. Your court.</span></div>
  </section>;
}
