'use client';

/* oxlint-disable next/no-img-element -- Static export uses locally optimised WebP assets and has no image server. */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import './pudding.css';

const A = '/pudding-world/';
type MotionState = {
  paused: boolean;
  reduced: boolean;
  modal: boolean;
  resume: () => void;
};
const Motion = createContext<MotionState>({
  paused: false,
  reduced: false,
  modal: false,
  resume: () => {},
});

function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      style={diagonal ? { transform: 'rotate(-45deg)' } : undefined}
    >
      <path d="M4 12h15m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
function Bell() {
  return (
    <svg
      width="38"
      height="38"
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M7 33h34M11 31c0-17 26-17 26 0M6 38h36M24 17v-5m-4 0h8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
function Film({
  scene,
  title,
  children,
  className = '',
  token = 0,
}: {
  scene: 1 | 2 | 6;
  title: string;
  children?: ReactNode;
  className?: string;
  token?: number;
}) {
  const { paused, reduced, modal, resume } = useContext(Motion);
  const ref = useRef<HTMLVideoElement>(null);
  const box = useRef<HTMLElement>(null);
  const ended = useRef(false);
  const forced = useRef(false);
  const lastToken = useRef(0);
  const [near, setNear] = useState(false);
  const [visible, setVisible] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    const node = box.current;
    if (!node) return;
    const loader = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setNear(true);
      },
      { rootMargin: '200px' },
    );
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.15 },
    );
    loader.observe(node);
    observer.observe(node);
    return () => {
      loader.disconnect();
      observer.disconnect();
    };
  }, []);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const sync = () => {
      if (
        !paused &&
        !modal &&
        visible &&
        !document.hidden &&
        (!reduced || forced.current) &&
        !ended.current
      ) {
        void v.play().catch(() => setPlaying(false));
      } else v.pause();
    };
    sync();
    document.addEventListener('visibilitychange', sync);
    return () => {
      document.removeEventListener('visibilitychange', sync);
      v.pause();
    };
  }, [paused, reduced, modal, visible, ready]);
  const replay = useCallback(() => {
    const v = ref.current;
    if (!v || failed) return;
    forced.current = true;
    ended.current = false;
    resume();
    v.currentTime = 0;
    if (!document.hidden && !modal)
      void v.play().catch(() => setPlaying(false));
  }, [failed, modal, resume]);
  useEffect(() => {
    if (token > 0 && token !== lastToken.current) {
      lastToken.current = token;
      replay();
    }
  }, [token, replay]);
  return (
    <figure className={`film-frame ${className}`} ref={box} aria-label={title}>
      <img
        src={`${A}scene-${scene}.webp`}
        alt={title}
        loading={scene === 6 ? 'eager' : 'lazy'}
        fetchPriority={scene === 6 ? 'high' : 'auto'}
      />
      {near && (
        <video
          ref={ref}
          src={`${A}film-${scene}.mp4`}
          poster={`${A}film-${scene}-poster.webp`}
          className={ready && !failed ? 'is-ready' : ''}
          muted
          playsInline
          preload="metadata"
          aria-label={`${title} film`}
          onLoadedData={() => setReady(true)}
          onError={() => {
            setFailed(true);
            setPlaying(false);
          }}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => {
            ended.current = true;
            forced.current = false;
            setPlaying(false);
          }}
        />
      )}
      {children}
      <button
        className="film-replay"
        onClick={replay}
        disabled={failed}
        aria-label={`Replay ${title} film`}
      >
        <span aria-hidden="true">↻</span>
        {failed
          ? 'Still edition'
          : playing
            ? 'Playing · Replay'
            : 'Replay film'}
      </button>
    </figure>
  );
}

function Counter({ onInspect }: { onInspect: () => void }) {
  const { reduced, paused } = useContext(Motion);
  const [open, setOpen] = useState(false);
  const [nudges, setNudges] = useState(0);
  const pudding = useRef<HTMLImageElement>(null);
  const anim = useRef<Animation | null>(null);
  useEffect(() => () => anim.current?.cancel(), []);
  useEffect(() => {
    if (open) pudding.current?.parentElement?.focus({ preventScroll: true });
  }, [open]);
  useEffect(() => {
    if (paused || reduced) anim.current?.cancel();
  }, [paused, reduced]);
  function wobble() {
    setNudges((n) => n + 1);
    if (reduced || paused || !pudding.current) return;
    anim.current?.cancel();
    anim.current = pudding.current.animate(
      [
        { transform: 'rotate(0deg) scale(1,1)' },
        { transform: 'rotate(-7deg) scale(1.055,.96)', offset: 0.18 },
        { transform: 'rotate(5deg) scale(.98,1.025)', offset: 0.38 },
        { transform: 'rotate(-3deg)', offset: 0.57 },
        { transform: 'rotate(1.5deg)', offset: 0.76 },
        { transform: 'rotate(0deg) scale(1,1)' },
      ],
      { duration: 1400, easing: 'cubic-bezier(.22,.61,.36,1)' },
    );
  }
  return (
    <section
      className="counter-section"
      id="the-pudding"
      aria-labelledby="counter-title"
    >
      <div className={`counter-stage ${open ? 'uncovered' : ''}`}>
        <div className="counter-arch" aria-hidden="true" />
        <span className="stage-label">THE HOUSE SPECIAL</span>
        <div className="counter-sculpture">
          <button
            className="pudding-object"
            onClick={wobble}
            disabled={!open}
            aria-label="Give the pudding a wobble"
          >
            <img
              ref={pudding}
              src={`${A}product.png`}
              alt="The original Nancy pudding: mint fluted base, ivory swirl and red cherry"
            />
          </button>
          <div className="silver-plate" aria-hidden="true" />
          <button
            className="cloche"
            onClick={() => setOpen(true)}
            aria-label="Lift the silver cloche"
            tabIndex={open ? -1 : 0}
            aria-hidden={open}
          >
            <span className="cloche-knob" />
            <span className="cloche-dome">
              <span>N</span>
            </span>
            <span className="cloche-rim" />
          </button>
        </div>
        <div className="counter-stage-footer">
          <span aria-live="polite">
            {open
              ? nudges
                ? [
                    'Oh, hello.',
                    'A little less serious.',
                    'You have excellent taste.',
                  ][(nudges - 1) % 3]
                : 'Go on. Give it a little nudge.'
              : 'A little suspense is part of the service.'}
          </span>
          <button className="text-button" onClick={() => setOpen(!open)}>
            {open ? 'Cover again' : 'Lift the cloche'}{' '}
            <span aria-hidden="true">{open ? '↓' : '↑'}</span>
          </button>
        </div>
      </div>
      <div className="counter-copy reveal">
        <p className="eyebrow">01 / THE PUDDING</p>
        <h2 id="counter-title">
          Looks like <br />
          dessert.
          <br />
          <em>Has other plans.</em>
        </h2>
        <p>
          A familiar little silhouette with a rather unexpected second act. Mint
          flutes. A cream swirl. One very knowing cherry.
        </p>
        <p className="small-copy">
          A dessert-shaped pleasure object from Nancy.
          <br />
          For your bedside, not your dessert plate.
        </p>
        <button className="line-link" onClick={onInspect}>
          Meet the original <Arrow diagonal />
        </button>
      </div>
    </section>
  );
}

const rooms = [
  {
    title: 'The cream stair',
    caption: 'A swirl you could get lost in.',
    description: 'Follow the curve. Forget which floor you came for.',
    scene: 3,
  },
  {
    title: 'Room service',
    caption: 'Your evening, on a silver platter.',
    description: 'The linen has a mind of its own. So does the house special.',
    scene: 2,
  },
  {
    title: 'For later',
    caption: 'Something worth taking home.',
    description:
      'A ribbon, a little ritual, and absolutely no occasion required.',
    scene: 5,
  },
];
function Rooms() {
  const [selected, setSelected] = useState(0);
  const room = rooms[selected];
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  return (
    <section
      className="rooms-section"
      id="the-salon"
      aria-labelledby="salon-title"
    >
      <div className="section-top reveal">
        <p className="eyebrow">02 / THE SALON</p>
        <h2 id="salon-title">
          Stay for <em>a little longer.</em>
        </h2>
        <p>
          Good things happen
          <br />
          after the counter closes.
        </p>
      </div>
      <div className="salon-layout">
        <div className="room-visual" key={selected}>
          {room.scene === 2 ? (
            <Film scene={2} title="Room service" />
          ) : (
            <figure>
              <img
                src={`${A}scene-${room.scene}.webp`}
                alt={room.caption}
                loading="lazy"
              />
            </figure>
          )}
          <span className="room-index">0{selected + 1} / 03</span>
        </div>
        <div className="room-menu">
          <span className="eyebrow">A WALK THROUGH THE HOUSE</span>
          <div
            role="tablist"
            aria-label="Explore the salon"
            aria-orientation="vertical"
          >
            {rooms.map((r, i) => (
              <button
                key={r.title}
                ref={(el) => {
                  refs.current[i] = el;
                }}
                id={`room-tab-${i}`}
                role="tab"
                aria-selected={selected === i}
                aria-controls="room-description"
                tabIndex={selected === i ? 0 : -1}
                className={selected === i ? 'selected' : ''}
                onClick={() => setSelected(i)}
                onKeyDown={(e) => {
                  let next = i;
                  if (e.key === 'ArrowDown' || e.key === 'ArrowRight')
                    next = (i + 1) % rooms.length;
                  else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft')
                    next = (i + rooms.length - 1) % rooms.length;
                  else if (e.key === 'Home') next = 0;
                  else if (e.key === 'End') next = rooms.length - 1;
                  else return;
                  e.preventDefault();
                  setSelected(next);
                  refs.current[next]?.focus();
                }}
              >
                <span>0{i + 1}</span>
                {r.title}
                <Arrow />
              </button>
            ))}
          </div>
          <div
            className="room-description"
            id="room-description"
            role="tabpanel"
            aria-labelledby={`room-tab-${selected}`}
          >
            <h3>{room.caption}</h3>
            <p>{room.description}</p>
          </div>
          <p className="menu-note">No rush. We’ve put the clock away.</p>
        </div>
      </div>
    </section>
  );
}

function OriginalDialog({ close }: { close: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [back, setBack] = useState(false);
  useEffect(() => {
    const node = ref.current;
    node?.showModal();
    const before = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      node?.close();
      document.body.style.overflow = before;
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className="product-dialog"
      aria-labelledby="original-title"
      onCancel={(e) => {
        e.preventDefault();
        close();
      }}
    >
      <div className="dialog-inside">
        <button className="dialog-close" onClick={close} autoFocus>
          Close <span aria-hidden="true">×</span>
        </button>
        <div className="original-photo">
          <img
            src={`${A}${back ? 'product-back.jpg' : 'product-reference.jpg'}`}
            alt={`Original supplied pudding product render, ${back ? 'back' : 'front'} view`}
          />
          <button className="line-link" onClick={() => setBack(!back)}>
            {back ? 'See the front' : 'Turn it around'}{' '}
            <span aria-hidden="true">↻</span>
          </button>
        </div>
        <div className="original-copy">
          <p className="eyebrow">BEHIND THE FANTASY</p>
          <h2 id="original-title">
            The real
            <br />
            <em>little troublemaker.</em>
          </h2>
          <p>
            This is the original product design. The salon, silver service and
            impossible architecture are our campaign daydream.
          </p>
          <a
            className="line-link"
            href="https://hellonancy.com/"
            target="_blank"
            rel="noreferrer"
          >
            Visit Hello Nancy <Arrow diagonal />
          </a>
        </div>
      </div>
    </dialog>
  );
}

function Souvenir() {
  const [saved, setSaved] = useState(false);
  const [savedUrl, setSavedUrl] = useState('');
  const [error, setError] = useState(false);
  useEffect(() => () => { if (savedUrl) URL.revokeObjectURL(savedUrl); }, [savedUrl]);
  async function save() {
    setError(false);
    try {
      await document.fonts.ready;
      const canvas = document.createElement('canvas');
      canvas.width = 1000;
      canvas.height = 1400;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas unavailable');
      ctx.fillStyle = '#f4eedf';
      ctx.fillRect(0, 0, 1000, 1400);
      ctx.strokeStyle = '#921e2d';
      ctx.lineWidth = 2;
      ctx.strokeRect(48, 48, 904, 1304);
      ctx.fillStyle = '#921e2d';
      ctx.textAlign = 'center';
      ctx.font = '78px Fraunces, Georgia, serif';
      ctx.fillText('Nancy Pâtisserie', 500, 190);
      ctx.font = '22px Rebond, sans-serif';
      ctx.fillText('A LITTLE SOMETHING FOR LATER', 500, 254);
      ctx.setLineDash([4, 8]);
      ctx.beginPath();
      ctx.moveTo(110, 325);
      ctx.lineTo(890, 325);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.font = 'italic 98px Fraunces, Georgia, serif';
      ctx.fillText('Life is short.', 500, 490);
      ctx.fillText('Lick the spoon.', 500, 608);
      ctx.font = '28px Rebond, sans-serif';
      [
        '01   A little mischief',
        '02   No special occasion',
        '03   A cherry on top',
      ].forEach((s, i) => ctx.fillText(s, 500, 785 + i * 78));
      ctx.beginPath();
      ctx.moveTo(110, 1040);
      ctx.lineTo(890, 1040);
      ctx.stroke();
      ctx.font = 'italic 42px Fraunces, Georgia, serif';
      ctx.fillText('Something sweet. For later.', 500, 1140);
      ctx.font = '22px Rebond, sans-serif';
      ctx.fillText('hellonancy.com', 500, 1210);
      ctx.font = '17px Rebond, sans-serif';
      ctx.fillText(
        'A souvenir from an imaginary salon. Not a purchase receipt.',
        500,
        1280,
      );
      const blob = await new Promise<Blob>((resolve, reject) =>
        canvas.toBlob(
          (b) => (b ? resolve(b) : reject(new Error('Export failed'))),
          'image/png',
        ),
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'nancy-patisserie-for-later.png';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setSavedUrl(url);
      setSaved(true);
    } catch {
      setError(true);
    }
  }
  return (
    <section className="souvenir-section" id="for-later">
      <div className="souvenir-copy reveal">
        <p className="eyebrow">03 / THE PARTING GIFT</p>
        <h2>
          Life is short.
          <br />
          <em>Lick the spoon.</em>
        </h2>
        <p>Take a little mischief with you.</p>
        <button className="pill-button" onClick={save}>
          {saved ? 'Save another for later' : 'A little something to keep'}{' '}
          <span aria-hidden="true">↓</span>
        </button>
        <output className="save-status">
          {error
            ? 'The souvenir couldn’t be saved. Please try again.'
            : saved
              ? 'Your keepsake is ready. Check your downloads.'
              : 'A keepsake from the house. On us.'}
        </output>
        {savedUrl && <a className="line-link souvenir-preview" href={savedUrl} target="_blank" rel="noreferrer">View your keepsake <Arrow diagonal /></a>}
      </div>
      <div className="receipt">
        <span className="receipt-brand">Nancy</span>
        <span className="eyebrow">PÂTISSERIE</span>
        <div className="receipt-dash" />
        <span className="receipt-title">For later.</span>
        <ul>
          <li>
            <span>A little mischief</span>
            <span>01</span>
          </li>
          <li>
            <span>No special occasion</span>
            <span>02</span>
          </li>
          <li>
            <span>A cherry on top</span>
            <span>03</span>
          </li>
        </ul>
        <div className="receipt-dash" />
        <p>Keep the good part.</p>
        <span className="receipt-small">SOUVENIR · NOT A PURCHASE RECEIPT</span>
        <div className="receipt-barcode" aria-hidden="true" />
      </div>
    </section>
  );
}

export default function PuddingWorld() {
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [modal, setModal] = useState(false);
  const [sound, setSound] = useState(false);
  const [bell, setBell] = useState(0);
  const opener = useRef<HTMLElement | null>(null);
  const audio = useRef<AudioContext | null>(null);
  const page = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const m = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(m.matches);
    update();
    m.addEventListener('change', update);
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        }),
      { threshold: 0.12 },
    );
    page.current
      ?.querySelectorAll('.reveal')
      .forEach((el) => observer.observe(el));
    return () => {
      m.removeEventListener('change', update);
      observer.disconnect();
      void audio.current?.close();
    };
  }, []);
  function ring() {
    setBell((n) => n + 1);
    setPaused(false);
    if (sound) {
      try {
        const ctx = audio.current ?? new AudioContext();
        audio.current = ctx;
        void ctx.resume();
        [1568, 2349].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.value = freq;
          gain.gain.setValueAtTime(0.0001, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(
            0.045,
            ctx.currentTime + 0.012,
          );
          gain.gain.exponentialRampToValueAtTime(
            0.0001,
            ctx.currentTime + 1.25 + i * 0.15,
          );
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 1.5);
        });
      } catch {
        setSound(false);
      }
    }
  }
  function closeModal() {
    setModal(false);
    requestAnimationFrame(() => opener.current?.focus());
  }
  return (
    <Motion.Provider
      value={{ paused, reduced, modal, resume: () => setPaused(false) }}
    >
      <div
        className="patisserie"
        ref={page}
        data-motion={paused || reduced ? 'still' : 'on'}
      >
        <a className="skip-link" href="#the-pudding">
          Skip to the pudding
        </a>
        <header className="site-header" id="top">
          <a className="brand" href="#top" aria-label="Nancy Pâtisserie, top">
            <img src="/assets/nancy-logo.png" alt="Nancy" />
            <span>PÂTISSERIE</span>
          </a>
          <nav aria-label="Main">
            <a href="#the-pudding">The pudding</a>
            <a href="#the-salon">The salon</a>
            <a href="#for-later">
              For later <Arrow diagonal />
            </a>
          </nav>
          <button
            className="motion-control"
            onClick={() => setPaused(!paused)}
            aria-pressed={paused}
            aria-label={paused ? 'Resume motion' : 'Pause motion'}
          >
            <span aria-hidden="true">{paused ? '▷' : 'Ⅱ'}</span>
            <span>{paused ? 'Play' : 'Pause'}</span>
          </button>
        </header>
        <main>
          <section className="hero" aria-labelledby="hero-title">
            <div className="hero-copy">
              <div className="hero-kicker">
                <span className="little-star" aria-hidden="true">
                  ✳
                </span>
                <span>
                  A DESSERT SALON
                  <br />
                  WITH OTHER INTENTIONS.
                </span>
              </div>
              <h1 id="hero-title">
                Something
                <br />
                sweet.
                <br />
                <em>For later.</em>
              </h1>
              <p className="hero-description">
                The shop is closed. <br />
                Your evening isn’t.
              </p>
              <div className="service">
                <button
                  className="service-bell"
                  onClick={ring}
                  aria-label="Ring for service"
                >
                  <Bell />
                </button>
                <div>
                  <button className="service-label" onClick={ring}>
                    Ring for service <Arrow />
                  </button>
                  <span className="service-status" aria-live="polite">
                    {bell
                      ? 'Right this way. We saved you a place.'
                      : 'A little ceremony never hurt.'}
                  </span>
                </div>
              </div>
              <label className="sound-switch">
                <input
                  type="checkbox"
                  checked={sound}
                  onChange={(e) => setSound(e.target.checked)}
                />
                Hear the bell
              </label>
              <span className="hero-footnote">
                A NANCY WORLD · IMAGINATION SERVED DAILY
              </span>
            </div>
            <div className="hero-art">
              <Film scene={6} title="The last sitting" token={bell} />
              <div className="hero-art-label">
                <span>MAISON NANCY</span>
                <span>THE LAST SITTING / 001</span>
              </div>
              <div className="hero-seal" aria-hidden="true">
                <span>PLEASURE</span>
                <i>à la carte</i>
                <span>WITH A CHERRY ON TOP</span>
              </div>
            </div>
          </section>
          <div
            className="house-ribbon"
            aria-label="Pleasure is always on the menu"
          >
            <span>PLEASURE IS ALWAYS ON THE MENU</span>
            <span aria-hidden="true">✳</span>
            <span>TAKE YOUR TIME</span>
            <span aria-hidden="true">✳</span>
            <span>A LITTLE LESS WELL-BEHAVED</span>
          </div>
          <section className="welcome" aria-labelledby="welcome-title">
            <p className="eyebrow reveal">WELCOME TO NANCY PÂTISSERIE</p>
            <div className="welcome-grid">
              <h2 className="reveal" id="welcome-title">
                We saved you
                <br />
                the <em>last pudding.</em>
              </h2>
              <div className="welcome-note reveal">
                <p>
                  A silver cloche lifts. A cherry gives a little bow. Somewhere,
                  the cream has become a staircase.
                </p>
                <p>
                  Come in. The sweetest part
                  <br />
                  of the day starts here.
                </p>
                <a className="line-link" href="#the-pudding">
                  Meet the house special <Arrow />
                </a>
              </div>
            </div>
            <Film scene={1} title="The grand salon" className="grand-salon">
              <figcaption>
                <span>THE HOUSE SPECIAL</span>
                <span>BEST ENJOYED AT YOUR OWN PACE.</span>
              </figcaption>
            </Film>
          </section>
          <Counter
            onInspect={() => {
              opener.current = document.activeElement as HTMLElement;
              setModal(true);
            }}
          />
          <div className="interlude" aria-hidden="true">
            <span>Just</span>
            <img src={`${A}product.png`} alt="" loading="lazy" />
            <em>one more.</em>
          </div>
          <Rooms />
          <Souvenir />
        </main>
        <footer>
          <a className="footer-wordmark" href="#top">
            Nancy <em>Pâtisserie</em>
          </a>
          <div className="footer-bottom">
            <p>
              An imaginary dessert salon.
              <br />A very real appetite for pleasure.
            </p>
            <span className="footer-concept">
              A NANCY CAMPAIGN CONCEPT
              <br />
              DESSERT-SHAPED. NOT EDIBLE.
            </span>
            <a href="https://hellonancy.com/" target="_blank" rel="noreferrer">
              Hello Nancy <Arrow diagonal />
            </a>
            <a href="#top" aria-label="Back to top">
              Back to top ↑
            </a>
          </div>
        </footer>
        {modal && <OriginalDialog close={closeModal} />}
      </div>
    </Motion.Provider>
  );
}
