'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import './living-court.css';

const collection = 'https://hellonancy.com/collections/tennis-collection-limited-edition';
const treatments = [
  { id: 'court', name: 'In the court', note: 'Pleasure is the point.' },
  { id: 'type', name: 'Through the type', note: 'A world within a word.' },
  { id: 'touch', name: 'At your touch', note: 'Go at your own pace.' },
] as const;
type Treatment = typeof treatments[number]['id'];

export function LivingCourt({ scene = 'original' }: { scene?: 'daydream' | 'electric' | 'original' }) {
  const filmSource = scene === 'original' ? '/tennis-world/films/embrace-higgsfield.mp4' : `/tennis-world/color-courts/${scene}.mp4`;
  const poster = scene === 'original' ? '/tennis-world/films/poster-landscape.jpg' : `/tennis-world/color-courts/${scene}.jpg`;
  const root = useRef<HTMLElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const hold = useRef(false);
  const engaged = useRef(false);
  const inView = useRef(true);
  const mode = useRef<Treatment>('court');
  const pressure = useRef<HTMLDivElement>(null);
  const [treatment, setTreatment] = useState<Treatment>('court');
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [paused, setPaused] = useState(false);
  const [manual, setManual] = useState(false);
  const [held, setHeld] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  useEffect(() => {
    const film = video.current;
    if (!film) return;
    const markReady = () => { if (film.readyState >= 2) { setReady(true); setFailed(false); } };
    markReady();
    film.addEventListener('loadeddata', markReady);
    film.addEventListener('canplay', markReady);
    return () => { film.removeEventListener('loadeddata', markReady); film.removeEventListener('canplay', markReady); };
  }, []);

  useEffect(() => {
    const film = video.current;
    if (!film) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    let active = true;
    const sync = () => {
      if (!inView.current || document.hidden || paused || (reduced.matches && !manual) || (treatment === 'touch' && !engaged.current)) film.pause();
      else void film.play().catch(() => { if (active) setPlaying(false); });
    };
    const observer = new IntersectionObserver(([entry]) => { inView.current = entry.isIntersecting; sync(); }, { threshold: .12 });
    if (root.current) observer.observe(root.current);
    document.addEventListener('visibilitychange', sync);
    reduced.addEventListener('change', sync);
    sync();
    return () => { active = false; observer.disconnect(); document.removeEventListener('visibilitychange', sync); reduced.removeEventListener('change', sync); film.pause(); };
  }, [treatment, paused, manual]);

  useEffect(() => {
    const film = video.current;
    if (!film) return;
    let handle = 0;
    const hasVideoFrames = typeof film.requestVideoFrameCallback === 'function';
    const draw = () => {
      const peak = Math.min(3.4, (film.duration || 6) * .57);
      const amount = Math.max(0, Math.min(1, film.currentTime <= peak ? film.currentTime / peak : ((film.duration || 6) - film.currentTime) / ((film.duration || 6) - peak)));
      root.current?.style.setProperty('--feel', String(amount));
      pressure.current?.style.setProperty('transform', `scaleX(${amount})`);
      if (mode.current === 'touch' && hold.current && film.currentTime >= peak) {
        film.pause();
      }
      if (hasVideoFrames) handle = film.requestVideoFrameCallback(draw);
    };
    if (hasVideoFrames) handle = film.requestVideoFrameCallback(draw);
    else film.addEventListener('timeupdate', draw);
    return () => { if (handle) film.cancelVideoFrameCallback(handle); film.removeEventListener('timeupdate', draw); };
  }, []);

  function select(next: Treatment) {
    if (next === treatment) return;
    hold.current = false;
    engaged.current = false;
    setHeld(false);
    mode.current = next;
    setTreatment(next);
    setResetKey(value => value + 1);
    if (next === 'touch' && video.current) {
      video.current.pause();
      video.current.currentTime = 0;
      root.current?.style.setProperty('--feel', '0');
    }
  }

  function feel(down: boolean) {
    const film = video.current;
    if (!film || failed || !ready || mode.current !== 'touch') return;
    if (!down && !engaged.current) return;
    hold.current = down;
    setHeld(down);
    if (down) {
      engaged.current = true;
      setManual(true);
      setPaused(false);
      if (film.currentTime >= 3.4) film.currentTime = 0;
    }
    if (inView.current && !document.hidden) void film.play().catch(() => setPlaying(false));
  }

  function toggle() {
    const film = video.current;
    if (!film) return;
    if (film.paused) { engaged.current = true; setManual(true); setPaused(false); void film.play().catch(() => setPlaying(false)); }
    else { setPaused(true); film.pause(); }
  }

  const current = treatments.find(item => item.id === treatment)!;
  return <section ref={root} id="center-court" className={`lc-court lc-${treatment} ${ready && !failed ? 'lc-ready' : ''} ${held ? 'lc-held' : ''}`} aria-labelledby="lc-title" style={{ '--feel': 0 } as CSSProperties}>
    <h1 id="lc-title" className="sr-only">LOVE ALL — A Nancy Tennis Club</h1>
    <div className="lc-picture" aria-hidden="true" style={{ backgroundImage: `url('${poster}')` }} />
    <video ref={video} className="lc-film" src={filmSource} poster={poster} muted playsInline loop={treatment !== 'touch'} preload="metadata" aria-label={`Two monumental felt tennis balls move together in the ${scene} court`} onLoadedData={() => { setReady(true); setFailed(false); }} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onError={() => { if (video.current?.error) { setFailed(true); setPlaying(false); } }} onEnded={() => { if (mode.current === 'touch' && video.current) { engaged.current = false; video.current.currentTime = 0; root.current?.style.setProperty('--feel', '0'); } }} />
    <div className="lc-shade" aria-hidden="true" />
    <div className="lc-window" aria-hidden="true"><span>LOVE</span><span>ALL</span></div>
    <div className="lc-upper"><span>A Nancy Tennis Club</span><span>Good form. Better feelings.</span></div>
    <div className="lc-heading" key={resetKey}><p>{current.note}</p><div className="lc-wordmark" aria-hidden="true"><span>LOVE</span><span>ALL<span className="lc-period">.</span></span></div></div>
    <div className="lc-side"><span className="lc-edition">CENTER COURT / 001</span><p>Nothing to prove.<br />Everything to feel.</p><a href={collection} target="_blank" rel="noreferrer">Take a little<br />of the club home <span aria-hidden="true">↗</span></a></div>
    <div className="lc-touch-copy" aria-hidden={treatment !== 'touch'}><span>A little give.</span><p>SO<span>F</span>T.</p></div>
    <div className="lc-touch-control" hidden={treatment !== 'touch'}><button type="button" className="lc-hold" aria-label="Hold to bring the tennis balls closer" aria-pressed={held} disabled={!ready || failed} onPointerDown={event => { event.currentTarget.setPointerCapture(event.pointerId); feel(true); }} onPointerUp={() => feel(false)} onPointerCancel={() => feel(false)} onLostPointerCapture={() => { if (hold.current) feel(false); }} onKeyDown={event => { if ((event.key === ' ' || event.key === 'Enter') && !event.repeat) { event.preventDefault(); feel(true); } }} onKeyUp={event => { if (event.key === ' ' || event.key === 'Enter') { event.preventDefault(); feel(false); } }} onBlur={() => { if (hold.current) feel(false); }}><span className="lc-hold-dot" /><span>{held ? 'Stay here a moment.' : 'Press & hold. Feel a little closer.'}</span></button><div className="lc-pressure"><div ref={pressure} /></div></div>
    <div className="lc-bottom"><div className="lc-treatments" aria-label="Choose a way to experience the court">{treatments.map((item, index) => <button type="button" key={item.id} aria-pressed={item.id === treatment} onClick={() => select(item.id)}><span>0{index + 1}</span><span>{item.name}</span><i aria-hidden="true" /></button>)}</div><div className="lc-transport"><span>{failed ? 'Still view' : 'The Embrace · 6 seconds'}</span><button type="button" onClick={toggle} disabled={!ready || failed} aria-label={playing ? 'Pause the living court' : 'Play the living court'}>{playing ? 'Pause' : 'Play'}<span aria-hidden="true">{playing ? 'Ⅱ' : '▷'}</span></button></div></div>
    <a className="lc-enter" href="#the-idea"><span>Step inside the club</span><span aria-hidden="true">↓</span></a>
  </section>;
}
