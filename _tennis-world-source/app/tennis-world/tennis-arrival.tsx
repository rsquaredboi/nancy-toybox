'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import './tennis-arrival.css';

const ArrivalContext = createContext<(() => void) | null>(null);

export function ArrivalReplay() {
  const replay = useContext(ArrivalContext);
  return <button type="button" className="arrival-replay" onClick={replay ?? undefined}>Replay entrance <span aria-hidden="true">↻</span></button>;
}

export function TennisArrival({ children }: { children: ReactNode }) {
  const [run, setRun] = useState(1);
  const [open, setOpen] = useState(true);
  const replay = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    setRun(value => value + 1);
    setOpen(true);
  }, []);
  const finish = useCallback(() => setOpen(false), []);
  return <ArrivalContext.Provider value={replay}>
    <div className="arrival-page">{children}</div>
    {open && <Entrance key={run} onFinish={finish} />}
    <noscript><style>{'.arrival-overlay{display:none!important}'}</style></noscript>
  </ArrivalContext.Provider>;
}

function Entrance({ onFinish }: { onFinish: () => void }) {
  const root = useRef<HTMLDialogElement>(null);
  const ball = useRef<HTMLDivElement>(null);
  const lines = useRef<HTMLDivElement>(null);
  const skip = useRef<HTMLButtonElement>(null);
  const dismiss = useRef<(() => void) | null>(null);
  const [message, setMessage] = useState('A little warm-up.');
  const [score, setScore] = useState('00');

  useEffect(() => {
    const overlay = root.current;
    const sphere = ball.current;
    const lettering = lines.current;
    const stage = document.querySelector<HTMLDivElement>('.arrival-page');
    if (!overlay || !sphere || !lettering || !stage) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const animations: Animation[] = [];
    const timers: ReturnType<typeof setTimeout>[] = [];
    const cleanups: (() => void)[] = [];
    let active = true;
    let leaving = false;
    let finished = false;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previous = { bodyOverflow: document.body.style.overflow, htmlOverflow: document.documentElement.style.overflow, inert: stage.inert, background: document.body.style.backgroundColor };
    document.body.style.overflow = 'hidden';
    document.body.style.backgroundColor = '#263ecc';
    document.documentElement.style.overflow = 'hidden';
    stage.inert = true;
    skip.current?.focus({ preventScroll: true });

    const animate = (element: Element, frames: Keyframe[], options: KeyframeAnimationOptions) => {
      const animation = element.animate(frames, options);
      animations.push(animation);
      return animation.finished.catch(() => undefined);
    };
    const restore = () => {
      document.body.style.overflow = previous.bodyOverflow;
      document.body.style.backgroundColor = previous.background;
      document.documentElement.style.overflow = previous.htmlOverflow;
      stage.inert = previous.inert;
      stage.style.removeProperty('clip-path');
      stage.style.removeProperty('will-change');
    };
    const complete = () => {
      if (finished || !active) return;
      finished = true;
      const moveFocus = overlay.contains(document.activeElement);
      restore();
      animations.forEach(animation => animation.cancel());
      if (moveFocus) {
        if (previousFocus && previousFocus !== document.body && stage.contains(previousFocus)) previousFocus.focus({ preventScroll: true });
        else stage.querySelector<HTMLElement>('#tw-main')?.focus({ preventScroll: true });
      }
      onFinish();
    };
    dismiss.current = complete;
    const delay = (ms: number) => new Promise<void>(resolve => timers.push(setTimeout(resolve, ms)));
    const poster = new Image();
    poster.src = stage.querySelector<HTMLVideoElement>('.lc-film')?.poster || '/tennis-world/color-courts/daydream.jpg';
    const posterReady = poster.decode().catch(() => undefined);
    const film = stage.querySelector<HTMLVideoElement>('.lc-film');
    const filmReady = new Promise<void>(resolve => {
      if (!film || film.readyState >= 2 || film.error) return resolve();
      const done = () => resolve();
      film.addEventListener('loadeddata', done, { once: true });
      film.addEventListener('error', done, { once: true });
      cleanups.push(() => { film.removeEventListener('loadeddata', done); film.removeEventListener('error', done); });
    });
    const fontsReady = Promise.allSettled([
      document.fonts.load('600 100px Rebond'),
      document.fonts.load('400 24px Fraunces'),
    ]);
    // A decoded poster is a valid destination when autoplay or video delivery is unavailable.
    const ready = Promise.allSettled([fontsReady, Promise.race([filmReady, posterReady])]);
    const width = window.innerWidth;
    const height = window.innerHeight;
    const diameter = Math.min(116, width * .2);
    sphere.style.width = `${diameter}px`;
    sphere.style.height = `${diameter}px`;
    const pose = (x: number, y: number, turn: number, squash = 1) => `translate3d(${x - diameter / 2}px,${y - diameter / 2}px,0) rotate(${turn}deg) scale(${1 / squash},${squash})`;
    const rest = pose(width * .64, height * .52, 175);
    sphere.style.transform = rest;
    if (!reduced.matches) {
      void animate(sphere, [
        { transform: pose(width * .11, height * .24, -130), offset: 0 },
        { transform: pose(width * .25, height * .71, -35, .76), offset: .25, easing: 'cubic-bezier(.16,.65,.35,1)' },
        { transform: pose(width * .46, height * .23, 75), offset: .57, easing: 'cubic-bezier(.5,0,.75,.4)' },
        { transform: pose(width * .64, height * .69, 150, .82), offset: .82, easing: 'cubic-bezier(.16,1,.3,1)' },
        { transform: rest, offset: 1 },
      ], { duration: 2200, fill: 'forwards', easing: 'linear' });
      timers.push(setTimeout(() => { if (active && !leaving) { setScore('15'); setMessage('Finding our soft spot.'); } }, 560));
      timers.push(setTimeout(() => { if (active && !leaving) setScore('30'); }, 1250));
      timers.push(setTimeout(() => { if (active && !leaving) setScore('40'); }, 1850));
    }

    const reveal = async () => {
      if (!active || leaving || finished) return;
      leaving = true;
      setScore('LOVE');
      setMessage('Your court.');
      overlay.dataset.phase = 'reveal';
      if (reduced.matches) {
        await animate(overlay, [{ opacity: 1 }, { opacity: 0 }], { duration: 180, fill: 'forwards' });
        complete();
        return;
      }
      const target = stage.querySelector<HTMLElement>('.lc-wordmark');
      const targetBounds = target?.getBoundingClientRect();
      const visibleHero = targetBounds && targetBounds.top >= 0 && targetBounds.top < height && getComputedStyle(target!).visibility !== 'hidden';
      const dot = visibleHero ? target?.querySelector<HTMLElement>('.lc-period')?.getBoundingClientRect() : undefined;
      const x = dot ? dot.x + dot.width / 2 : width / 2;
      const y = dot ? dot.y + dot.height / 2 : height / 2;
      const ballScale = dot ? dot.width / diameter : .22;
      const ink = target ? getComputedStyle(target).color : '#26358a';
      void animate(overlay.querySelector('.arrival-interface')!, [{ opacity: 1 }, { opacity: 0 }], { duration: 350, fill: 'forwards' });
      if (visibleHero && target) {
        [...lettering.children].forEach((line, index) => {
          const destination = target.children[index]?.getBoundingClientRect();
          const source = line.getBoundingClientRect();
          if (!destination) return;
          const scale = parseFloat(getComputedStyle(target).fontSize) / parseFloat(getComputedStyle(line).fontSize);
          void animate(line, [{ transform: 'none', color: '#f6a0c6' }, { transform: `translate(${destination.x - source.x}px,${destination.y - source.y}px) scale(${scale})`, color: ink }], { duration: 800, easing: 'cubic-bezier(.76,0,.24,1)', fill: 'forwards' });
        });
      } else void animate(lettering, [{ opacity: 1 }, { opacity: 0 }], { duration: 450, fill: 'forwards' });
      void animate(sphere, [{ transform: rest }, { transform: `translate3d(${x - diameter / 2}px,${y - diameter / 2}px,0) rotate(250deg) scale(${ballScale})` }], { duration: 800, easing: 'cubic-bezier(.76,0,.24,1)', fill: 'forwards' });
      sphere.querySelectorAll('i').forEach(seam => void animate(seam, [{ opacity: 1 }, { opacity: 0 }], { duration: 550, fill: 'forwards' }));
      // The actual page is revealed through the iris, so there is no duplicate film or final-frame swap.
      stage.style.willChange = 'clip-path';
      stage.style.clipPath = `circle(0px at ${x}px ${y + window.scrollY}px)`;
      overlay.style.background = 'transparent';
      const radius = Math.hypot(Math.max(x, width - x), Math.max(y, height - y)) + 30;
      await animate(stage, [{ clipPath: `circle(0px at ${x}px ${y + window.scrollY}px)` }, { clipPath: `circle(${radius}px at ${x}px ${y + window.scrollY}px)` }], { duration: 1100, easing: 'cubic-bezier(.76,0,.24,1)', fill: 'forwards' });
      await animate(overlay, [{ opacity: 1 }, { opacity: 0 }], { duration: 160, fill: 'forwards' });
      complete();
    };
    // Readiness is real; the tennis score is a warm-up ritual, never a fabricated download percentage.
    void Promise.all([ready, delay(reduced.matches ? 0 : 2250)]).then(reveal);
    timers.push(setTimeout(() => { void reveal(); }, 6500));
    // A resize invalidates the ball path and matched geometry. Finish cleanly instead.
    const onResize = () => complete();
    const onPreference = () => { if (reduced.matches) complete(); };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') complete();
      if (event.key === 'Tab') { event.preventDefault(); skip.current?.focus(); }
    };
    document.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize);
    reduced.addEventListener('change', onPreference);
    return () => {
      active = false;
      timers.forEach(clearTimeout);
      cleanups.forEach(cleanup => cleanup());
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onResize);
      reduced.removeEventListener('change', onPreference);
      animations.forEach(animation => animation.cancel());
      restore();
      dismiss.current = null;
    };
  }, [onFinish]);

  return <dialog open ref={root} className="arrival-overlay" aria-modal="true" aria-labelledby="arrival-title">
    <h2 id="arrival-title" className="sr-only">Warming up the Nancy Tennis Club</h2>
    <div className="arrival-interface">
      <div className="arrival-top"><span>A NANCY TENNIS CLUB</span><span>EST. IN THE FEELING</span></div>
      <div className="arrival-court" aria-hidden="true"><i /><i /><i /></div>
      <p className="arrival-aside">Good form.<br /><em>Better feelings.</em></p>
      <div className="arrival-score" aria-hidden="true"><span>THE WARM-UP</span><strong key={score}>{score}</strong><span>NO PRESSURE TO WIN</span></div>
      <div className="arrival-bottom"><output aria-live="polite">{message}</output><span>PLEASURE IS THE POINT.</span></div>
    </div>
    <div ref={lines} className="arrival-wordmark" aria-hidden="true"><span>LOVE</span><span>ALL<span className="arrival-period">.</span></span></div>
    <div ref={ball} className="arrival-ball" aria-hidden="true"><i /><i /></div>
    <button ref={skip} type="button" className="arrival-skip" onClick={() => dismiss.current?.()}>Skip the warm-up <span aria-hidden="true">↗</span></button>
  </dialog>;
}
