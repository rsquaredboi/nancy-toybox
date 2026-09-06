'use client';
/* oxlint-disable next/no-img-element -- Local film posters use explicit dimensions and native loading. */

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrivalReplay } from './tennis-arrival';
import './soft-machines.css';

const MotionContext = createContext({ still: false, reduced: false, toggle: () => {} });
const art = '/tennis-world/soft-machines';
const rooms = [
  { slug: 'bloom', title: 'The Bloom', number: '01', href: '#center-court', detail: 'A very different kind of opening.', type: 'Felt / chrome / a deep breath' },
  { slug: 'unravelling', title: 'The Unravelling', number: '02', href: '#the-unravelling', detail: 'Even the rules are soft here.', type: 'Mesh / gravity / letting go' },
  { slug: 'day-off', title: 'The Day Off', number: '03', href: '#clubhouse', detail: 'An official surrender.', type: 'An umpire / absolutely no authority' },
] as const;

export function SoftExhibition({ children }: { children: ReactNode }) {
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(preference.matches);
    update();
    preference.addEventListener('change', update);
    return () => preference.removeEventListener('change', update);
  }, []);
  const still = paused || reduced;
  return <MotionContext.Provider value={{ still, reduced, toggle: () => setPaused(value => !value) }}>
    <div className={`sm-exhibition${still ? ' sm-still' : ''}`}>{children}</div>
  </MotionContext.Provider>;
}

export function MotionToggle() {
  const { still, reduced, toggle } = useContext(MotionContext);
  return <button className="sm-motion-toggle" type="button" aria-pressed={still} onClick={toggle} disabled={reduced} title={reduced ? 'Following your device’s reduced motion preference' : undefined} aria-label={reduced ? 'Reduced motion follows your device setting' : still ? 'Resume exhibition motion' : 'Pause exhibition motion'}>
    <span className="sm-motion-glyph" aria-hidden="true"><i /><i /><i /></span>{reduced ? 'Reduced motion' : still ? 'Motion off' : 'Motion on'}
  </button>;
}

// Attach a source only near the viewport. Posters remain meaningful without video or autoplay.
function Film({ slug, title, hero = false }: { slug: string; title: string; hero?: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);
  const { still } = useContext(MotionContext);
  const [loaded, setLoaded] = useState(hero);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    let visible = false;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => {
      if (visible && !still && !reduce.matches && !document.hidden && !document.querySelector('.sm-cinema[open]')) void video.play().catch(() => undefined);
      else video.pause();
    };
    const observe = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; update(); }, { threshold: .05 });
    const preload = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setLoaded(true); preload.disconnect(); } }, { rootMargin: '500px' });
    observe.observe(video);
    preload.observe(video);
    const onReady = () => { setReady(true); update(); };
    video.addEventListener('loadeddata', onReady);
    video.addEventListener('canplay', onReady);
    document.addEventListener('visibilitychange', update);
    document.addEventListener('sm-cinema-change', update);
    reduce.addEventListener('change', update);
    if (video.readyState >= 2) setReady(true);
    return () => { observe.disconnect(); preload.disconnect(); video.pause(); video.removeEventListener('loadeddata', onReady); video.removeEventListener('canplay', onReady); document.removeEventListener('visibilitychange', update); document.removeEventListener('sm-cinema-change', update); reduce.removeEventListener('change', update); };
  }, [still, loaded]);
  return <div className={`sm-film${ready ? ' sm-film-ready' : ''}`}>
    <img src={`${art}/${slug}.jpg`} alt="" width="1600" height="900" loading={hero ? 'eager' : 'lazy'} fetchPriority={hero ? 'high' : 'auto'} />
    <video ref={ref} className={hero ? 'lc-film' : undefined} src={loaded ? `${art}/${slug}.mp4` : undefined} poster={`${art}/${slug}.jpg`} muted loop playsInline preload={hero ? 'auto' : 'metadata'} aria-label={title} />
  </div>;
}

function CinemaButton({ slug, title }: { slug: string; title: string }) {
  const [open, setOpen] = useState(false);
  return <>
    <button className="sm-watch" type="button" onClick={() => setOpen(true)}><span aria-hidden="true">▷</span> Watch the film <span aria-hidden="true">↗</span></button>
    {open && <Cinema slug={slug} title={title} close={() => setOpen(false)} />}
  </>;
}

function Cinema({ slug, title, close }: { slug: string; title: string; close: () => void }) {
  const modal = useRef<HTMLDialogElement>(null);
  const film = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const dialog = modal.current;
    if (!dialog) return;
    const previous = document.body.style.overflow;
    const focus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    document.body.style.overflow = 'hidden';
    dialog.showModal();
    document.dispatchEvent(new Event('sm-cinema-change'));
    void film.current?.play().catch(() => undefined);
    return () => { dialog.close(); document.dispatchEvent(new Event('sm-cinema-change')); document.body.style.overflow = previous; focus?.focus({ preventScroll: true }); };
  }, []);
  return <dialog ref={modal} className="sm-cinema" aria-label={`${title} film`} onCancel={event => { event.preventDefault(); close(); }}>
    <div className="sm-cinema-top"><span>LOVE ALL / {title}</span><button type="button" onClick={close} autoFocus>Close <span aria-hidden="true">×</span></button></div>
    <video ref={film} src={`${art}/${slug}.mp4`} poster={`${art}/${slug}.jpg`} muted loop playsInline controls aria-label={`${title}, full film`} />
    <p>A Nancy universe production. <span>Take your time.</span></p>
  </dialog>;
}

export function SoftHero() {
  const root = useRef<HTMLElement>(null);
  const { still } = useContext(MotionContext);
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    if (still) return;
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const section = root.current!;
      const timeline = gsap.timeline({ scrollTrigger: { trigger: section, start: 'top top', end: 'bottom top', scrub: .8 } });
      timeline.to('.sm-hero-art', { yPercent: 16, scale: 1.06, ease: 'none' }, 0)
        .to('.sm-hero-heading', { yPercent: -24, opacity: .2, ease: 'none' }, 0)
        .to('.sm-hero-stamp', { rotation: 55, yPercent: -40, ease: 'none' }, 0);
    }, root);
    return () => media.revert();
  }, [still]);
  return <section ref={root} className="sm-hero" id="center-court" aria-labelledby="sm-title">
    <div className="sm-hero-art"><Film slug="bloom" title="A monumental tennis-ball flower slowly opens and breathes in a sunlit gallery" hero /></div>
    <div className="sm-hero-top"><span>A NANCY TENNIS CLUB</span><span>EXHIBITION 001<br />THE SOFT MACHINES</span></div>
    <div className="sm-hero-heading"><p>Pleasure is the point.</p><h1 id="sm-title" className="lc-wordmark"><span>LOVE</span><span>ALL<span className="lc-period">.</span></span></h1><p className="sm-hero-sub">A beautifully strange place<br />to stop keeping score.</p></div>
    <a href="#the-idea" className="sm-hero-stamp" aria-label="Enter the exhibition"><svg viewBox="0 0 120 120" aria-hidden="true"><defs><path id="sm-stamp-path" d="M60,60 m-45,0 a45,45 0 1,1 90,0 a45,45 0 1,1 -90,0" /></defs><text><textPath href="#sm-stamp-path" textLength="282">PLEASURE IS THE POINT · LOVE ALL · </textPath></text></svg><span aria-hidden="true">↓</span></a>
    <div className="sm-hero-bottom"><a href="#the-idea">Step out of the ordinary <span aria-hidden="true">↓</span></a><span className="sm-hero-caption"><i /> 01 — THE BLOOM</span><CinemaButton slug="bloom" title="The Bloom" /></div>
    <ArrivalReplay />
  </section>;
}

export function ExhibitionIndex() {
  const root = useRef<HTMLElement>(null);
  const { still } = useContext(MotionContext);
  useEffect(() => {
    if (still) return;
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.from('.sm-index-title .sm-line-inner', { yPercent: 105, rotate: 3, stagger: .09, duration: 1.25, ease: 'power4.out', scrollTrigger: { trigger: root.current, start: 'top 80%', once: true } });
      gsap.from('.sm-room-link', { y: 65, opacity: 0, stagger: .12, duration: 1.1, ease: 'power3.out', scrollTrigger: { trigger: '.sm-room-links', start: 'top 90%', once: true } });
      gsap.to('.sm-chrome-ball', { rotation: 90, y: -60, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: 1 } });
    }, root);
    return () => media.revert();
  }, [still]);
  return <section ref={root} className="sm-index" id="the-idea" aria-labelledby="sm-index-title">
    <div className="sm-eyebrow"><span>WELCOME TO THE SOFT MACHINES</span><span>THREE ROOMS. ZERO RULES.</span></div>
    <div className="sm-index-intro"><h2 className="sm-index-title" id="sm-index-title"><span className="sm-line"><span className="sm-line-inner">Something</span></span><span className="sm-line"><em className="sm-line-inner">soft is taking over.</em></span></h2><div className="sm-index-aside"><div className="sm-chrome-ball" aria-hidden="true"><i /><i /></div><p>The flower opens.<br />The net lets go.<br />The umpire surrenders.</p></div></div>
    <div className="sm-room-links">{rooms.map(room => <a key={room.slug} className="sm-room-link" href={room.href}>
      <div className="sm-room-preview"><img src={`${art}/${room.slug}.jpg`} alt="" width="1600" height="900" loading="lazy" /><span className="sm-room-arrow" aria-hidden="true">↗</span></div>
      <div className="sm-room-name"><span>{room.number}</span><h3>{room.title}</h3><span aria-hidden="true">↗</span></div><p>{room.detail}</p>
    </a>)}</div>
    <div className="sm-index-footer"><span>An invitation to feel everything.<br />And prove absolutely nothing.</span><a href="#the-unravelling">Let yourself in <span aria-hidden="true">↓</span></a></div>
  </section>;
}

export function FilmRoom({ scene }: { scene: 'unravelling' | 'day-off' }) {
  const root = useRef<HTMLElement>(null);
  const { still } = useContext(MotionContext);
  const room = rooms.find(item => item.slug === scene)!;
  const net = scene === 'unravelling';
  useEffect(() => {
    if (still) return;
    const media = gsap.matchMedia();
    media.add({ desktop: '(min-width: 768px)', mobile: '(max-width: 767px)', reduced: '(prefers-reduced-motion: reduce)' }, context => {
      if (context.conditions?.reduced) return;
      const mobile = context.conditions?.mobile;
      const timeline = gsap.timeline({ scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom bottom', scrub: .7, invalidateOnRefresh: true } });
      timeline.fromTo('.sm-room-window', { clipPath: mobile ? 'inset(17% 7% 22% 7% round 45% 45% 0 0)' : 'inset(12% 24% 13% 24% round 45% 45% 0 0)' }, { clipPath: 'inset(0% 0% 0% 0% round 0% 0% 0% 0%)', duration: .58, ease: 'power2.inOut' }, 0)
        .fromTo('.sm-room-window .sm-film', { scale: 1.18 }, { scale: 1, duration: .75, ease: 'none' }, 0)
        .to('.sm-room-title .sm-room-word:first-child', { xPercent: net ? -44 : -30, yPercent: -45, opacity: 0, duration: .48, ease: 'power2.in' }, .06)
        .to('.sm-room-title .sm-room-word:last-child', { xPercent: 36, yPercent: 45, opacity: 0, duration: .48, ease: 'power2.in' }, .06)
        .fromTo('.sm-room-note', { y: 35, opacity: 0 }, { y: 0, opacity: 1, duration: .24 }, .54)
        .fromTo('.sm-room-meter i', { scaleX: 0 }, { scaleX: 1, duration: 1, ease: 'none' }, 0);
    }, root);
    return () => media.revert();
  }, [still, net]);
  return <section ref={root} className={`sm-room sm-room-${scene}`} id={net ? 'the-unravelling' : 'clubhouse'} aria-labelledby={`sm-${scene}-title`}>
    <div className="sm-room-sticky">
      <div className="sm-room-window"><Film slug={scene} title={net ? 'An ivory tennis net floats in a slow wave above a pink ball in a cobalt room' : 'A monumental chrome umpire chair bows as its lime felt drape softens'} /></div>
      <div className="sm-room-top"><span>{room.number} / {room.title.toUpperCase()}</span><span>{net ? 'LET THE RULES UNRAVEL.' : 'AUTHORITY HAS LEFT THE BUILDING.'}</span></div>
      <h2 className="sm-room-title" id={`sm-${scene}-title`}><span className="sm-room-word">{net ? 'LET' : 'DAY'}</span><em className="sm-room-word">{net ? 'go.' : 'off.'}</em></h2>
      <div className="sm-room-note"><span>{net ? 'The point is not to win.' : 'No one is keeping score.'}</span><p>{net ? <>It’s to feel<br /><em>something.</em></> : <>Permission to<br /><em>do nothing.</em></>}</p></div>
      <div className="sm-room-bottom"><span>{room.type}</span><CinemaButton slug={scene} title={room.title} /></div>
      <div className="sm-room-meter" aria-hidden="true"><i /></div>
    </div>
  </section>;
}

export function SoftMarquee() {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => element.classList.toggle('is-visible', entry.isIntersecting));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return <div ref={root} className="sm-marquee" aria-label="Less performance. More pleasure."><div aria-hidden="true">{[0,1].map(i => <span key={i}>LESS PERFORMANCE. <em>MORE PLEASURE.</em> <b>↗</b> </span>)}</div></div>;
}
