'use client';
/* oxlint-disable next/no-img-element -- Curated local media and original product photography. */
/* oxlint-disable next/no-html-link-for-pages -- Native links also work in the GitHub Pages export. */

import {
  Component,
  createContext,
  lazy,
  Suspense,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { NetControls } from './net-scene';
import './match-off.css';

const NetScene = lazy(() => import('./net-scene'));

class NetBoundary extends Component<
  { onFailure: () => void; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onFailure();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}
const ART = '/tennis-world/match-off';
const COLLECTION =
  'https://hellonancy.com/collections/tennis-collection-limited-edition';
const Motion = createContext({
  still: false,
  sound: false,
  note: (_tone: 'thread' | 'ball' | 'soft') => {},
});
const films = [
  { id: '085', title: 'The net reaches back', loop: false },
  { id: '097', title: 'Mutual attraction', loop: true },
  { id: '098', title: 'Coming undone', loop: false },
  { id: '088', title: 'A change of boundaries', loop: true },
  { id: '096', title: 'The court takes a day off', loop: false },
  { id: '087', title: 'Inseparable', loop: true },
  { id: '095', title: 'An open invitation', loop: true },
  { id: '090', title: 'The match can wait', loop: true },
  { id: '094', title: 'Carried away', loop: false },
  { id: '103', title: 'A soft spot for Ace', loop: false },
  { id: '104', title: 'Reserved for pleasure', loop: false },
];

function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={diagonal ? 'mo-arrow mo-arrow-diagonal' : 'mo-arrow'}
    >
      <path d="M4 12h15m-6-6 6 6-6 6" />
    </svg>
  );
}

function Film({
  id,
  label,
  loop = false,
  eager = false,
  paused = false,
  className = '',
  seek = null,
  onProgress,
}: {
  id: string;
  label: string;
  loop?: boolean;
  eager?: boolean;
  paused?: boolean;
  className?: string;
  seek?: number | null;
  onProgress?: (progress: number) => void;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const { still } = useContext(Motion);
  const [source, setSource] = useState(eager);
  const [failed, setFailed] = useState(false);
  const [blocked, setBlocked] = useState(false);
  useEffect(() => {
    if (source || !frame.current) return;
    const preload = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSource(true);
          preload.disconnect();
        }
      },
      { rootMargin: '300px' },
    );
    preload.observe(frame.current);
    return () => preload.disconnect();
  }, [source]);
  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    let visible = false,
      disposed = false;
    const play = () => {
      if (
        visible &&
        !still &&
        !paused &&
        seek === null &&
        !document.hidden &&
        !failed &&
        !video.ended
      ) {
        void video
          .play()
          .then(() => {
            if (!disposed) setBlocked(false);
          })
          .catch(() => {
            if (!disposed) setBlocked(true);
          });
      } else video.pause();
    };
    const observe = new IntersectionObserver(
      ([e]) => {
        visible = e.isIntersecting;
        play();
      },
      { threshold: 0.15 },
    );
    observe.observe(video);
    video.addEventListener('canplay', play);
    document.addEventListener('visibilitychange', play);
    return () => {
      disposed = true;
      observe.disconnect();
      video.pause();
      video.removeEventListener('canplay', play);
      document.removeEventListener('visibilitychange', play);
    };
  }, [still, paused, source, failed, seek]);
  useEffect(() => {
    const video = ref.current;
    if (!video || seek === null) return;
    const position = () => {
      if (Number.isFinite(video.duration))
        video.currentTime = Math.min(
          video.duration - 0.04,
          (video.duration * seek) / 100,
        );
    };
    position();
    video.addEventListener('loadedmetadata', position);
    return () => video.removeEventListener('loadedmetadata', position);
  }, [seek, source]);
  return (
    <div ref={frame} className={`mo-film ${className}`}>
      <img
        src={`${ART}/${id}-poster.jpg`}
        alt={label}
        width="1600"
        height="900"
        loading={eager ? 'eager' : 'lazy'}
      />
      {source && !failed && (
        <video
          ref={ref}
          src={`${ART}/${id}.mp4`}
          poster={`${ART}/${id}-poster.jpg`}
          muted
          playsInline
          loop={loop}
          preload={eager ? 'auto' : 'metadata'}
          aria-label={label}
          onTimeUpdate={(e) => {
            if (seek === null && Number.isFinite(e.currentTarget.duration))
              onProgress?.(
                (e.currentTarget.currentTime / e.currentTarget.duration) * 100,
              );
          }}
          onError={() => setFailed(true)}
        />
      )}
      {blocked && !still && !paused && !failed && seek === null && (
        <button
          className="mo-film-play"
          onClick={() => {
            void ref.current
              ?.play()
              .then(() => setBlocked(false))
              .catch(() => undefined);
          }}
          aria-label={`Play ${label}`}
        >
          Play film <Arrow />
        </button>
      )}
    </div>
  );
}

function ObjectPortrait({
  name,
  id,
  description,
  line,
  href,
  film = false,
  paused,
}: {
  name: 'Ace' | 'Smash';
  id: string;
  description: string;
  line: string;
  href: string;
  film?: boolean;
  paused: boolean;
}) {
  const [productView, setProductView] = useState(false);
  const [take, setTake] = useState(0);
  const { still } = useContext(Motion);
  const slug = name.toLowerCase();
  return (
    <article
      className={`mo-product mo-product-${slug}`}
      aria-labelledby={`${slug}-title`}
    >
      <fieldset className="mo-object-toolbar" aria-label={`${name} image view`}>
        <span>
          {name === 'Ace' ? '01' : '02'} / {name}
        </span>
        <div>
          <button
            aria-pressed={!productView}
            onClick={() => setProductView(false)}
          >
            In our world
          </button>
          <button
            aria-pressed={productView}
            onClick={() => setProductView(true)}
          >
            Product
          </button>
        </div>
      </fieldset>
      <div className={`mo-object-portrait ${productView ? 'is-product' : ''}`}>
        <img
          className="mo-object-official"
          src={`/tennis-world/${slug}-official.png`}
          alt={`Original Nancy ${name} product and packaging photograph`}
          aria-hidden={!productView}
          width="2048"
          height="2048"
          loading="lazy"
        />
        <div
          className="mo-object-world"
          aria-hidden={productView}
          inert={productView}
        >
          {film ? (
            <Film
              key={take}
              id={id}
              label="Pink Nancy Ace cradled by a net that slowly leans toward it"
              paused={paused || productView}
            />
          ) : (
            <img
              src={`${ART}/${id}-poster.jpg`}
              alt="Lime Nancy Smash supported by a sculptural chrome ribbon on the pink court"
              width="1450"
              height="1800"
              loading="lazy"
            />
          )}
          <span className="mo-object-inscription">
            {name === 'Ace' ? 'A soft spot for you.' : 'Quite the attraction.'}
          </span>
          {film && !still && (
            <button
              className="mo-object-replay"
              onClick={() => setTake((t) => t + 1)}
              aria-label={`Replay ${name} film`}
            >
              Again? ↻
            </button>
          )}
        </div>
      </div>
      <a
        className="mo-product-caption"
        href={href}
        target="_blank"
        rel="noreferrer"
        aria-label={`Meet ${name} — shop Nancy`}
      >
        <h3 id={`${slug}-title`}>{name}</h3>
        <p>
          {description}
          <br />
          {line}
        </p>
        <span className="mo-product-shop">
          Meet {name} <Arrow diagonal />
        </span>
      </a>
    </article>
  );
}

function Reserved({ paused }: { paused: boolean }) {
  const [take, setTake] = useState(0);
  const { still } = useContext(Motion);
  return (
    <section className="mo-reserved" aria-labelledby="reserved-title">
      <Film
        key={take}
        id="104"
        label="The pink court ripples gently around a green Ace presentation box"
        paused={paused}
      />
      <span className="mo-reserved-eyebrow">THE COURT HAS A SOFT SPOT.</span>
      <h2 id="reserved-title">
        Reserved
        <br />
        <em>for pleasure.</em>
      </h2>
      {!still && (
        <button
          className="mo-reserved-replay"
          onClick={() => setTake((t) => t + 1)}
        >
          One more ripple ↻
        </button>
      )}
    </section>
  );
}

function Entrance({ close, ready }: { close: () => void; ready: boolean }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const strand = useRef<SVGPathElement>(null);
  const state = useRef({ pulling: false, amount: 0, busy: false });
  const { still, note } = useContext(Motion);
  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    d.showModal();
    return () => {
      document.body.style.overflow = overflow;
      d.close();
    };
  }, []);
  const enter = () => {
    if (state.current.busy) return;
    state.current.busy = true;
    note('thread');
    const finish = () => {
      try {
        sessionStorage.setItem('nancy-match-entered', '1');
      } catch {
        /* Storage is optional. */
      }
      close();
    };
    if (still) {
      finish();
      return;
    }
    const timeline = gsap.timeline({ onComplete: finish });
    timeline
      .to('.mo-entry-inner', {
        y: -24,
        opacity: 0,
        duration: 0.35,
        ease: 'power2.in',
      })
      .to(
        dialog.current,
        { clipPath: 'inset(0 0 100% 0)', duration: 0.95, ease: 'power4.inOut' },
        0.18,
      );
  };
  return (
    <dialog
      ref={dialog}
      className="mo-entrance"
      aria-label="Enter the Nancy tennis club"
      onCancel={(e) => {
        e.preventDefault();
        enter();
      }}
    >
      <img
        className="mo-entry-texture"
        src={`${ART}/084.jpg`}
        alt=""
        width="1600"
        height="893"
      />
      <div className="mo-entry-inner">
        <div className="mo-entry-top">
          <img
            src="/assets/nancy-logo.png"
            alt="Nancy"
            width="440"
            height="161"
          />
          <span>A PRIVATE LITTLE ESCAPE</span>
        </div>
        <div className="mo-entry-copy">
          <p>
            Pleasure
            <br />
            <em>before points.</em>
          </p>
          <span>LOVE ALL / A NANCY TENNIS CLUB</span>
        </div>
        <div
          className="mo-thread"
          onPointerDown={(e) => {
            state.current.pulling = true;
            e.currentTarget.setPointerCapture(e.pointerId);
          }}
          onPointerMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = Math.max(
              100,
              Math.min(900, ((e.clientX - rect.left) / rect.width) * 1000),
            );
            const y = Math.max(
              -110,
              Math.min(110, e.clientY - rect.top - rect.height / 2),
            );
            state.current.amount = y;
            if (!still)
              strand.current?.setAttribute(
                'd',
                `M0 150 Q${x} ${150 + y * (state.current.pulling ? 2 : 0.4)} 1000 150`,
              );
          }}
          onPointerUp={(e) => {
            if (state.current.pulling) {
              state.current.pulling = false;
              if (e.currentTarget.hasPointerCapture(e.pointerId))
                e.currentTarget.releasePointerCapture(e.pointerId);
              enter();
            }
          }}
          onPointerCancel={() => {
            state.current.pulling = false;
            strand.current?.setAttribute('d', 'M0 150 Q500 150 1000 150');
          }}
          onPointerLeave={() => {
            if (!state.current.pulling)
              strand.current?.setAttribute('d', 'M0 150 Q500 150 1000 150');
          }}
        >
          <svg
            viewBox="0 0 1000 300"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path ref={strand} d="M0 150 Q500 150 1000 150" />
          </svg>
          <button
            type="button"
            className="mo-enter-button"
            onClick={enter}
            autoFocus
          >
            Pull to enter <span>or simply click</span>
          </button>
        </div>
        <div className="mo-entry-bottom">
          <span>{ready ? 'THE COURT IS YOURS.' : 'TAKE YOUR TIME.'}</span>
          <button type="button" onClick={enter}>
            Step inside <Arrow />
          </button>
        </div>
      </div>
    </dialog>
  );
}

function Cinema({ close }: { close: () => void }) {
  const modal = useRef<HTMLDialogElement>(null);
  const [selected, setSelected] = useState(films[0]);
  useEffect(() => {
    const el = modal.current;
    if (!el) return;
    const focused =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    el.showModal();
    return () => {
      el.close();
      document.body.style.overflow = overflow;
      focused?.focus({ preventScroll: true });
    };
  }, []);
  return (
    <dialog
      ref={modal}
      className="mo-cinema"
      aria-label="The Nancy film room"
      onCancel={(e) => {
        e.preventDefault();
        close();
      }}
    >
      <div className="mo-cinema-top">
        <span>LOVE ALL / THE FILM ROOM</span>
        <button onClick={close} autoFocus>
          Close <span aria-hidden="true">×</span>
        </button>
      </div>
      <div className="mo-cinema-screen">
        <video
          key={selected.id}
          src={`${ART}/${selected.id}.mp4`}
          poster={`${ART}/${selected.id}-poster.jpg`}
          muted
          controls
          autoPlay
          playsInline
          loop={selected.loop}
          aria-label={selected.title}
        />
      </div>
      <div className="mo-film-selection">
        {films.map((film, index) => (
          <button
            key={film.id}
            aria-pressed={film.id === selected.id}
            onClick={() => setSelected(film)}
          >
            <span>{String(index + 1).padStart(2, '0')}</span>
            {film.title}
          </button>
        ))}
      </div>
    </dialog>
  );
}

function ClubMenu({ close }: { close: () => void }) {
  const modal = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const el = modal.current;
    if (!el) return;
    const focused =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    el.showModal();
    return () => {
      el.close();
      document.body.style.overflow = overflow;
      focused?.focus({ preventScroll: true });
    };
  }, []);
  return (
    <dialog
      ref={modal}
      className="mo-club-menu"
      aria-label="Explore the Nancy club"
      onCancel={(e) => {
        e.preventDefault();
        close();
      }}
    >
      <div className="mo-menu-top">
        <span>MAKE YOURSELF AT HOME.</span>
        <button onClick={close} autoFocus aria-label="Close club menu">
          ×
        </button>
      </div>
      <nav aria-label="Club chapters">
        <a href="#center-court" onClick={close}>
          <span>01</span>The court <Arrow />
        </a>
        <a href="#the-idea" onClick={close}>
          <span>02</span>The feeling <Arrow />
        </a>
        <a href="#boundaries" onClick={close}>
          <span>03</span>Out of line <Arrow />
        </a>
        <a href="#equipment" onClick={close}>
          <span>04</span>The collection <Arrow />
        </a>
        <a href="#clubhouse" onClick={close}>
          <span>05</span>After hours <Arrow />
        </a>
      </nav>
      <p>A Nancy universe production.</p>
    </dialog>
  );
}

function Court({ close }: { close: () => void }) {
  const modal = useRef<HTMLDialogElement>(null);
  const controls = useRef<NetControls | null>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [phase, setPhase] = useState<'waiting' | 'serving' | 'caught'>(
    'waiting',
  );
  const { still, note } = useContext(Motion);
  const [quiet, setQuiet] = useState(false);
  useEffect(() => {
    const el = modal.current;
    if (!el) return;
    const focused =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    el.showModal();
    return () => {
      el.close();
      document.body.style.overflow = overflow;
      focused?.focus({ preventScroll: true });
    };
  }, []);
  const caught = useCallback(() => {
    setPhase('caught');
    note('soft');
  }, [note]);
  const serving = useCallback(() => {
    setPhase('serving');
    note('ball');
  }, [note]);
  const register = useCallback((controller: NetControls | null) => {
    controls.current = controller;
  }, []);
  const loaded = useCallback(() => setReady(true), []);
  const failure = useCallback(() => setFailed(true), []);
  const serve = () => {
    if (phase === 'caught') {
      controls.current?.reset();
      setPhase('waiting');
    } else if (phase === 'waiting') controls.current?.serve();
  };
  return (
    <dialog
      ref={modal}
      className="mo-court"
      aria-label="Your interactive tennis court"
      onCancel={(e) => {
        e.preventDefault();
        close();
      }}
    >
      <section
        className={`mo-play-court mo-phase-${phase}${ready ? ' mo-scene-ready' : ''}${failed ? ' mo-scene-failed' : ''}`}
      >
        <div className="mo-hero-fallback">
          <Film
            id="097"
            label="An ivory net cradles a pink tennis ball"
            eager
            loop
            paused={!failed}
          />
        </div>
        {!failed && (
          <NetBoundary onFailure={failure}>
            <Suspense fallback={null}>
              <NetScene
                still={still || quiet}
                active
                onControls={register}
                onReady={loaded}
                onFailure={failure}
                onCatch={caught}
                onServe={serving}
              />
            </Suspense>
          </NetBoundary>
        )}
        <div className="mo-court-top">
          <span>CENTER COURT / YOURS TO TOUCH</span>
          <button onClick={close} autoFocus>
            Back to the world <span aria-hidden="true">×</span>
          </button>
        </div>
        <div className="mo-court-copy">
          <h2>
            {phase === 'caught' ? (
              <>
                Caught
                <br />
                <em>feelings.</em>
              </>
            ) : (
              <>
                Your
                <br />
                <em>serve.</em>
              </>
            )}
          </h2>
          <p aria-live="polite">
            {failed
              ? 'This browser can’t open the interactive court. Enjoy the film instead.'
              : phase === 'caught'
                ? 'The net’s in love. We might be here a while.'
                : phase === 'serving'
                  ? 'Oh. Something’s happening.'
                  : 'The court has other plans.'}
          </p>
        </div>
        {!failed && (
          <div className="mo-serve-panel">
            <button
              className="mo-serve"
              onClick={serve}
              disabled={!ready || phase === 'serving'}
              aria-label={
                phase === 'caught' ? 'Try another serve' : 'Serve the ball'
              }
            >
              <span>
                {!ready
                  ? 'Opening the court…'
                  : phase === 'caught'
                    ? 'One more time'
                    : phase === 'serving'
                      ? 'A little chemistry…'
                      : 'Serve the ball'}
              </span>
              <Arrow />
            </button>
            <span className="mo-drag-hint">
              {phase === 'waiting'
                ? 'OR DRAG & RELEASE THE PINK BALL'
                : phase === 'caught'
                  ? 'MATCH ABANDONED. MUTUAL ATTRACTION.'
                  : 'PLEASURE IS THE POINT.'}
            </span>
          </div>
        )}
        <div
          className="mo-score"
          aria-label={
            phase === 'caught' ? 'Score: Love, Love' : 'Score: zero, zero'
          }
        >
          <span>YOU</span>
          <strong>{phase === 'caught' ? 'LOVE' : '00'}</strong>
          <i />
          <strong>{phase === 'caught' ? 'LOVE' : '00'}</strong>
          <span>THE COURT</span>
        </div>
        {!still && (
          <button
            className="mo-court-pause"
            aria-pressed={quiet}
            onClick={() => setQuiet((p) => !p)}
          >
            {quiet ? 'Resume motion' : 'Pause motion'}
          </button>
        )}
      </section>
    </dialog>
  );
}

function LooseLine({ paused }: { paused: boolean }) {
  const [seek, setSeek] = useState<number | null>(null);
  const [position, setPosition] = useState(0);
  const { still, note } = useContext(Motion);
  return (
    <section
      className="mo-boundaries"
      id="boundaries"
      aria-labelledby="boundaries-title"
    >
      <div className="mo-section-label">
        <span>THE BASELINE</span>
        <span>ETIQUETTE IS OVERRATED.</span>
      </div>
      <div className="mo-boundary-copy" data-reveal>
        <h2 id="boundaries-title">
          Out
          <br />
          of <em>line.</em>
        </h2>
        <p>Go on. Bend the rules.</p>
      </div>
      <div className="mo-boundary-film">
        <Film
          id="088"
          label="An ivory court ribbon rises around a floating lime ball"
          loop
          paused={paused}
          seek={seek}
          onProgress={setPosition}
        />
      </div>
      <div className="mo-ribbon-control">
        <div>
          <label htmlFor="ribbon-position">Make your own rules</label>
          <span>{seek === null ? 'DRAG TO PLAY' : 'YOUR MOVE'}</span>
        </div>
        <input
          id="ribbon-position"
          type="range"
          min="0"
          max="100"
          step=".5"
          value={seek ?? position}
          aria-label="Move the ball along the ribbon"
          aria-valuetext={`${Math.round(seek ?? position)} percent along the ribbon`}
          onChange={(e) => setSeek(Number(e.target.value))}
          onPointerDown={() => note('thread')}
        />
        <button disabled={seek === null || still} onClick={() => setSeek(null)}>
          {still
            ? 'Motion is paused · you can still drag'
            : seek === null
              ? 'Following its own lead'
              : 'Let it wander again'}{' '}
          <Arrow />
        </button>
      </div>
    </section>
  );
}

function Souvenir() {
  const [status, setStatus] = useState('Save your club card');
  const save = async () => {
    setStatus('Preparing your card…');
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1200;
      canvas.height = 1500;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas unavailable');
      const image = new Image();
      image.src = `${ART}/073.jpg`;
      await image.decode();
      await document.fonts.ready;
      ctx.fillStyle = '#123d2b';
      ctx.fillRect(0, 0, 1200, 1500);
      ctx.drawImage(image, 0, 480, 1200, 670);
      ctx.fillStyle = '#f5f0df';
      ctx.font = '600 135px Rebond, sans-serif';
      ctx.fillText('LOVE ALL.', 75, 200);
      ctx.font = '30px Rebond, sans-serif';
      ctx.fillText('A NANCY TENNIS CLUB', 82, 270);
      ctx.strokeStyle = '#f5f0df';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(80, 346);
      ctx.lineTo(1120, 346);
      ctx.stroke();
      ctx.font = '24px Rebond, sans-serif';
      ctx.fillText('MATCH ABANDONED', 82, 405);
      ctx.font = '52px Rebond, sans-serif';
      ctx.fillText('Reason: mutual attraction.', 80, 1260);
      ctx.font = '24px Rebond, sans-serif';
      ctx.fillText('hellonancy.com     /     Pleasure is the point.', 82, 1380);
      canvas.toBlob((blob) => {
        if (!blob) {
          setStatus('Please try again');
          return;
        }
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'nancy-love-all-club-card.png';
        link.click();
        setTimeout(() => URL.revokeObjectURL(url), 30000);
        setStatus('Saved. See you around.');
      }, 'image/png');
    } catch {
      setStatus('Please try again');
    }
  };
  return (
    <button
      className="mo-text-link"
      disabled={status === 'Preparing your card…'}
      onClick={() => {
        void save();
      }}
      aria-live="polite"
    >
      {status}
      <Arrow diagonal />
    </button>
  );
}

export default function MatchOff() {
  const restored = useRef(false);
  const [entered, setEntered] = useState(false);
  const [showEntrance, setShowEntrance] = useState(false);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [sound, setSound] = useState(false);
  const [cinema, setCinema] = useState(false);
  const [court, setCourt] = useState(false);
  const [menu, setMenu] = useState(false);
  const obscured = cinema || court || menu || !entered;
  const audio = useRef<AudioContext | null>(null);
  const main = useRef<HTMLDivElement>(null);
  const still = paused || reduced;
  const note = useCallback((tone: 'thread' | 'ball' | 'soft') => {
    const context = audio.current;
    if (!context || context.state !== 'running') return;
    const osc = context.createOscillator(),
      gain = context.createGain();
    osc.connect(gain);
    gain.connect(context.destination);
    const time = context.currentTime;
    osc.type = tone === 'thread' ? 'triangle' : 'sine';
    osc.frequency.setValueAtTime(
      tone === 'thread' ? 168 : tone === 'ball' ? 130 : 74,
      time,
    );
    osc.frequency.exponentialRampToValueAtTime(
      tone === 'thread' ? 83 : 42,
      time + 0.3,
    );
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.exponentialRampToValueAtTime(
      tone === 'thread' ? 0.035 : 0.09,
      time + 0.01,
    );
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.65);
    osc.start(time);
    osc.stop(time + 0.7);
  }, []);
  // Browser preferences and session storage are read after hydration.
  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(preference.matches);
    update();
    preference.addEventListener('change', update);
    let visited = false;
    try {
      visited = sessionStorage.getItem('nancy-match-entered') === '1';
    } catch {
      /* Session storage is optional. */
    }
    // oxlint-disable-next-line react/react-compiler -- Hydrate the entrance from this browser session.
    if (visited || window.location.hash || preference.matches) setEntered(true);
    else setShowEntrance(true);
    return () => {
      preference.removeEventListener('change', update);
      void audio.current?.close();
    };
  }, []);
  useEffect(() => {
    if (!entered || still) return;
    gsap.registerPlugin(ScrollTrigger);
    const context = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) =>
        gsap.fromTo(
          el,
          { y: 55, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1.1,
            ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 91%', once: true },
          },
        ),
      );
      gsap.fromTo(
        '.mo-hero-title',
        { yPercent: 24, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: 1.5, ease: 'power3.out' },
      );
      gsap.to('.mo-hero-film', {
        yPercent: 12,
        ease: 'none',
        scrollTrigger: {
          trigger: '.mo-hero',
          start: 'top top',
          end: 'bottom top',
          scrub: 0.6,
        },
      });
      gsap.to('.mo-fold-picture', {
        yPercent: 9,
        ease: 'none',
        scrollTrigger: {
          trigger: '.mo-fold',
          start: 'top bottom',
          end: 'bottom top',
          scrub: 0.8,
        },
      });
    }, main);
    return () => context.revert();
  }, [entered, still]);
  useEffect(() => {
    if (!entered || restored.current) return;
    restored.current = true;
    const id = window.location.hash.slice(1);
    if (!id) return;
    const frame = requestAnimationFrame(() =>
      document.getElementById(id)?.scrollIntoView({ behavior: 'instant' }),
    );
    return () => cancelAnimationFrame(frame);
  }, [entered]);
  const toggleSound = async () => {
    try {
      if (!audio.current) audio.current = new AudioContext();
      if (sound) {
        await audio.current.suspend();
        setSound(false);
      } else {
        await audio.current.resume();
        setSound(true);
        note('thread');
      }
    } catch {
      setSound(false);
    }
  };
  const enter = () => {
    setShowEntrance(false);
    setEntered(true);
  };
  return (
    <Motion.Provider value={{ still, sound, note }}>
      <div
        ref={main}
        className={`mo-world${still ? ' mo-still' : ''}`}
        data-motion={still ? 'still' : 'on'}
      >
        <a className="mo-skip" href="#equipment">
          Skip to the collection
        </a>
        <header className="mo-header" id="tw-top">
          <a
            className="mo-logo"
            href="https://hellonancy.com/"
            aria-label="Nancy homepage"
          >
            <img
              src="/assets/nancy-logo.png"
              alt="Nancy"
              width="440"
              height="161"
            />
          </a>
          <nav aria-label="The club">
            <a href="#center-court">The court</a>
            <a href="#equipment">The collection</a>
            <a href="#clubhouse">After hours</a>
          </nav>
          <a
            className="mo-shop"
            href={COLLECTION}
            target="_blank"
            rel="noreferrer"
          >
            Shop Nancy <Arrow diagonal />
          </a>
          <button
            className="mo-menu-toggle"
            aria-label="Explore the club"
            aria-expanded={menu}
            onClick={() => setMenu(true)}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M3 8h18M3 16h18" />
            </svg>
          </button>
        </header>
        <main>
          <section
            className="mo-hero"
            id="center-court"
            aria-labelledby="mo-title"
          >
            <div className="mo-hero-film">
              <Film
                id="097"
                label="An ivory net embraces a monumental pink tennis ball"
                eager
                loop
                paused={obscured}
              />
            </div>
            <div className="mo-hero-shade" aria-hidden="true" />
            <div className="mo-hero-edition">
              <span>A NANCY TENNIS CLUB</span>
              <span>NO ONE IS KEEPING SCORE.</span>
            </div>
            <div className="mo-hero-aside">
              <p>
                The match
                <br />
                <em>is off.</em>
              </p>
              <button onClick={() => setCinema(true)}>
                <span aria-hidden="true">↗</span> The film room
              </button>
            </div>
            <div className="mo-hero-title">
              <h1 id="mo-title">
                LOVE ALL<span className="mo-period">.</span>
              </h1>
            </div>
            <div className="mo-hero-bottom">
              <button className="mo-touch" onClick={() => setCourt(true)}>
                Touch the court <Arrow diagonal />
              </button>
              <a href="#the-idea">
                Explore <span aria-hidden="true">↓</span>
              </a>
            </div>
          </section>

          <section className="mo-introduction" id="the-idea">
            <div className="mo-section-label">
              <span>AN UNEXPECTED CONNECTION</span>
              <span>LOVE — LOVE</span>
            </div>
            <div className="mo-intro-layout">
              <div className="mo-intro-copy" data-reveal>
                <h2>
                  It started
                  <br />
                  with a <em>feeling.</em>
                </h2>
                <p>
                  A net that reaches back.
                  <br />
                  An afternoon with no intention of ending.
                </p>
                <a className="mo-text-link" href="#boundaries">
                  Follow the feeling <Arrow />
                </a>
                <img
                  className="mo-intro-portrait"
                  src={`${ART}/062.jpg`}
                  alt="A player rests her head on her hand against a giant pink tennis ball"
                  width="1600"
                  height="893"
                  loading="lazy"
                />
              </div>
              <figure className="mo-encounter">
                <Film
                  id="085"
                  label="A player offers a ball and the net reaches toward her"
                  paused={obscured}
                />
                <figcaption>
                  <span>THE FIRST MOVE.</span>
                  <span>LOVE ALL / NANCY</span>
                </figcaption>
              </figure>
            </div>
            <div className="mo-macro">
              <Film
                id="098"
                label="The seam of a lime felt ball slowly opens"
                paused={obscured}
              />
              <span>
                Coming <em>undone.</em>
              </span>
            </div>
          </section>

          <LooseLine paused={obscured} />

          <section
            className="mo-fold"
            id="day-off"
            aria-labelledby="fold-title"
          >
            <div className="mo-fold-picture">
              <Film
                id="096"
                label="The pink court folds over a lime ball like a blanket"
                paused={obscured}
              />
              <img
                className="mo-fold-mobile"
                src={`${ART}/083.jpg`}
                alt="A corner of pink felt court folded gently over a lime ball"
                width="893"
                height="1600"
                loading="lazy"
              />
            </div>
            <div className="mo-fold-copy" data-reveal>
              <span>COURT CLOSED UNTIL FURTHER NOTICE</span>
              <h2 id="fold-title">
                Soft
                <br />
                <em>rules.</em>
              </h2>
            </div>
            <span className="mo-fold-note">PLEASE DO NOT DISTURB.</span>
          </section>

          <Reserved paused={obscured} />

          <section
            className="mo-equipment"
            id="equipment"
            aria-labelledby="equipment-title"
          >
            <div className="mo-section-label">
              <span>OBJECTS OF AFFECTION</span>
              <span>THE NANCY TENNIS COLLECTION</span>
            </div>
            <div className="mo-equipment-heading" data-reveal>
              <h2 id="equipment-title">
                Take the
                <br />
                <em>feeling home.</em>
              </h2>
              <p>
                Ace & Smash.
                <br />
                Made for your kind of play.
              </p>
            </div>
            <div className="mo-product-layout">
              <ObjectPortrait
                name="Ace"
                id="103"
                film
                paused={obscured}
                description="Air suction massager."
                line="A different kind of serve."
                href="https://hellonancy.com/products/ace-air-suction-massager"
              />
              <div className="mo-product-second">
                <ObjectPortrait
                  name="Smash"
                  id="105"
                  paused={obscured}
                  description="External wand."
                  line="Quite the power play."
                  href="https://hellonancy.com/products/smash-wand-vibrator"
                />
              </div>
            </div>
            <a
              className="mo-collection-link"
              href={COLLECTION}
              target="_blank"
              rel="noreferrer"
            >
              <span>The whole collection</span>
              <Arrow diagonal />
            </a>
          </section>

          <section
            className="mo-clubhouse"
            id="clubhouse"
            aria-labelledby="clubhouse-title"
          >
            <div className="mo-clubhouse-film">
              <Film
                id="090"
                label="The player makes herself comfortable in a suspended net with a pink tennis ball"
                loop
                paused={obscured}
              />
            </div>
            <div className="mo-clubhouse-content" data-reveal>
              <span>AFTER HOURS</span>
              <h2 id="clubhouse-title">
                Stay
                <br />
                <em>a little.</em>
              </h2>
            </div>
            <span className="mo-clubhouse-note">THE MATCH CAN WAIT.</span>
          </section>

          <section className="mo-exit">
            <div className="mo-exit-left">
              <span>A NANCY UNIVERSE PRODUCTION</span>
              <h2>
                Court closed.
                <br />
                <em>Plans improved.</em>
              </h2>
              <Souvenir />
              <div className="mo-doorway">
                <Film
                  id="095"
                  label="An ivory net curtain opens onto a glowing pink doorway"
                  loop
                  paused={obscured}
                />
                <span>THE DOOR IS ALWAYS OPEN.</span>
              </div>
            </div>
            <div className="mo-walk">
              <Film
                id="094"
                label="The player leaves carrying an oversized lime tennis ball"
                paused={obscured}
              />
              <span>TAKING THE FEELING WITH HER.</span>
            </div>
          </section>
        </main>
        <footer className="mo-footer">
          <a href="https://hellonancy.com/" className="mo-footer-logo">
            <img
              src="/assets/nancy-logo.png"
              alt="Nancy"
              width="440"
              height="161"
            />
          </a>
          <p>
            Pleasure, taken seriously.
            <br />
            Delivered playfully.
          </p>
          <div>
            <button
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'instant' });
                setShowEntrance(true);
                setEntered(false);
              }}
            >
              Replay the entrance
            </button>
            <a href="#tw-top">Back to court ↑</a>
          </div>
          <small>Independent Nancy creative concept.</small>
        </footer>
        <div className="mo-controls" aria-label="Experience settings">
          <button
            onClick={() => {
              void toggleSound();
            }}
            aria-pressed={sound}
            aria-label={sound ? 'Turn sound off' : 'Turn sound on'}
            title={sound ? 'Sound on' : 'Sound off'}
          >
            <span className="mo-sound-bars" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            <span className="mo-control-label">
              Sound {sound ? 'on' : 'off'}
            </span>
          </button>
          <button
            onClick={() => setPaused((p) => !p)}
            disabled={reduced}
            aria-pressed={still}
            aria-label={
              reduced
                ? 'Reduced motion follows your device setting'
                : still
                  ? 'Resume motion'
                  : 'Pause motion'
            }
            title={still ? 'Motion paused' : 'Pause motion'}
          >
            <svg viewBox="0 0 20 20" aria-hidden="true">
              {still ? (
                <path d="m7 4 9 6-9 6Z" />
              ) : (
                <path d="M7 4v12M13 4v12" />
              )}
            </svg>
            <span className="mo-control-label">{still ? 'Play' : 'Pause'}</span>
          </button>
        </div>
        {showEntrance && <Entrance close={enter} ready />}
        {cinema && <Cinema close={() => setCinema(false)} />}
        {court && <Court close={() => setCourt(false)} />}
        {menu && <ClubMenu close={() => setMenu(false)} />}
      </div>
    </Motion.Provider>
  );
}
