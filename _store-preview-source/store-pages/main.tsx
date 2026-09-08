'use client';
/* oxlint-disable next/no-img-element -- Standalone static campaign preview. */
import { createRoot } from 'react-dom/client';
import {
  lazy,
  Suspense,
  useEffect,
  useRef,
  useState,
  type SubmitEvent,
  type ReactNode,
} from 'react';
import './store.css';

const base = '/nancy-toybox/store-preview/';
const links = {
  home: base,
  worlds: base + 'worlds/',
  campaign: base + 'patisserie/',
  product: base + 'products/pudding/',
};
const media = '/pudding-world/';
const tennis = 'https://rsquaredboi.github.io/nancy-toybox/tennis-world/';
const route = location.pathname.includes('/products/pudding')
  ? 'product'
  : location.pathname.includes('/patisserie')
    ? 'campaign'
    : location.pathname.includes('/worlds')
      ? 'worlds'
      : 'home';
const Patisserie = lazy(() => import('../app/pudding-world/page'));
const notes = {
  home: {
    number: '01',
    title: 'The invitation.',
    path: 'hellonancy.com/',
    body: 'A launch moment above a familiar store. Pâtisserie gets the spotlight; the existing Nancy range is still one scroll away.',
    steps: [
      'The main action enters the campaign. The second goes straight to the pudding product page.',
      'Keep bestsellers and the existing shopping navigation visible.',
      'After launch, rotate the hero. The campaign keeps its place under Worlds.',
    ],
  },
  campaign: {
    number: '02',
    title: 'The world.',
    path: 'hellonancy.com/pages/patisserie',
    body: 'All the atmosphere of the standalone campaign, with a clear connection to the store.',
    steps: [
      'The store navigation stays available above the salon.',
      'The product link stays within reach while you enjoy the films and interactions.',
      'Build this as a dedicated Shopify template, with media loaded only where needed.',
    ],
  },
  product: {
    number: '03',
    title: 'The decision.',
    path: 'hellonancy.com/products/[pudding-handle]',
    body: 'The product is the hero. This proposed prelaunch version shows how a guest list would work before sales open.',
    steps: [
      'Use original product images for an honest view of shape and detail.',
      'Replace the guest list with real price, availability and Add to cart when the product is ready.',
      'This form is a local interaction demo. It sends and stores no email address.',
    ],
  },
  worlds: {
    number: '04',
    title: 'The collection of worlds.',
    path: 'hellonancy.com/pages/worlds',
    body: 'A permanent home for the stories. Tennis and Pâtisserie can live together without looking the same.',
    steps: [
      'Worlds becomes a destination in the main navigation.',
      'Each campaign keeps its own art direction and lasting URL.',
      'A world can sell one product or a whole collection. The store and checkout stay shared.',
    ],
  },
};

function Arrow({ external = false }: { external?: boolean }) {
  return (
    <span aria-hidden="true" className="sf-arrow">
      {external ? '↗' : '→'}
    </span>
  );
}
function LinkButton({
  href,
  children,
  secondary = false,
  external = false,
}: {
  href: string;
  children: ReactNode;
  secondary?: boolean;
  external?: boolean;
}) {
  return (
    <a
      className={'sf-button' + (secondary ? ' sf-button-light' : '')}
      href={href}
      {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
    >
      {children}
      <Arrow external={external} />
    </a>
  );
}

function PreviewBar({ onNotes }: { onNotes: () => void }) {
  return (
    <aside className="sf-preview" aria-label="Integration preview navigation">
      <span className="sf-preview-label">Integration preview</span>
      <nav aria-label="Preview pages">
        {(['home', 'campaign', 'product', 'worlds'] as const).map((key, i) => (
          <a
            key={key}
            href={links[key]}
            aria-current={route === key ? 'page' : undefined}
          >
            <span>0{i + 1}</span>{' '}
            {key === 'home'
              ? 'Homepage'
              : key === 'campaign'
                ? 'Campaign'
                : key === 'product'
                  ? 'Product'
                  : 'Worlds'}
          </a>
        ))}
      </nav>
      <button onClick={onNotes}>
        Why this works <span aria-hidden="true">+</span>
      </button>
    </aside>
  );
}

function Header({ onMenu, menu }: { onMenu: () => void; menu: boolean }) {
  return (
    <>
      <div className="sf-announcement">
        <a href={links.campaign}>
          An invitation to Nancy Pâtisserie.{' '}
          <span>Something sweet is waiting.</span> <Arrow />
        </a>
      </div>
      <header className="sf-header">
        <a href={links.home} className="sf-brand" aria-label="Nancy homepage">
          <img
            src="/assets/nancy-logo.png"
            alt="Nancy"
            width="123"
            height="48"
          />
        </a>
        <nav aria-label="Store navigation">
          <a href={links.home + '#favourites'}>Shop</a>
          <a
            href={links.worlds}
            aria-current={route === 'worlds' ? 'page' : undefined}
          >
            Worlds <span className="sf-nav-dot" />
          </a>
          <a
            href="https://hellonancy.com/pages/about-us"
            target="_blank"
            rel="noreferrer"
          >
            About Nancy
          </a>
          <a
            href="https://hellonancy.com/blogs/articles"
            target="_blank"
            rel="noreferrer"
          >
            Journal
          </a>
        </nav>
        <a
          className="sf-shop-online"
          href="https://hellonancy.com/collections/all"
          target="_blank"
          rel="noreferrer"
        >
          Shop online <Arrow />
        </a>
        <button
          className="sf-menu-button"
          onClick={onMenu}
          aria-expanded={menu}
          aria-controls="mobile-navigation"
        >
          {menu ? 'Close' : 'Menu'}{' '}
          <span aria-hidden="true">{menu ? '×' : '+'}</span>
        </button>
      </header>
      {menu && (
        <nav
          className="sf-mobile-menu"
          aria-label="Mobile store navigation"
          id="mobile-navigation"
        >
          <a onClick={onMenu} href={links.home + '#favourites'}>
            Shop the collection <Arrow />
          </a>
          <a onClick={onMenu} href={links.worlds}>
            Nancy Worlds <Arrow />
          </a>
          <a onClick={onMenu} href={links.campaign}>
            Nancy Pâtisserie <Arrow />
          </a>
          <a onClick={onMenu} href={links.product}>
            Meet the pudding <Arrow />
          </a>
          <a
            onClick={onMenu}
            href="https://hellonancy.com/"
            target="_blank"
            rel="noreferrer"
          >
            Visit the live store <Arrow />
          </a>
        </nav>
      )}
    </>
  );
}

function HouseFilm({
  scene = 1,
  paused = false,
  className = '',
}: {
  scene?: 1 | 2 | 6;
  paused?: boolean;
  className?: string;
}) {
  const video = useRef<HTMLVideoElement>(null);
  const box = useRef<HTMLElement>(null);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);
  const [near, setNear] = useState(false);
  const [visible, setVisible] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [manual, setManual] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  useEffect(() => {
    const m = matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(m.matches);
    update();
    m.addEventListener('change', update);
    return () => m.removeEventListener('change', update);
  }, []);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setNear(true);
        setVisible(e.isIntersecting);
      },
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const v = video.current;
    if (!v) return;
    function sync() {
      if (
        paused ||
        userPaused ||
        document.hidden ||
        !visible ||
        (reduced && !manual)
      ) {
        v?.pause();
      } else if (!v?.ended) {
        void v?.play().catch(() => {});
      }
    }
    sync();
    document.addEventListener('visibilitychange', sync);
    return () => {
      document.removeEventListener('visibilitychange', sync);
      v.pause();
    };
  }, [paused, userPaused, visible, reduced, manual, near]);
  function toggle() {
    const v = video.current;
    if (!v) return;
    if (!v.paused) {
      setUserPaused(true);
      v.pause();
      return;
    }
    setManual(true);
    setUserPaused(false);
    if (v.ended) v.currentTime = 0;
    void v.play().catch(() => setPlaying(false));
  }
  return (
    <figure
      ref={box}
      className={'sf-film ' + className}
      aria-label="Pâtisserie campaign film"
    >
      <img
        src={`${media}film-${scene}-poster.webp`}
        alt="The Nancy pudding presented under a silver cloche in an ivory and mint dessert salon"
      />
      {near && !failed && (
        <video
          ref={video}
          src={`${media}film-${scene}.mp4`}
          muted
          playsInline
          preload="metadata"
          onLoadedData={() => setReady(true)}
          onPlaying={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => setPlaying(false)}
          onError={() => setFailed(true)}
          className={ready ? 'sf-film-ready' : ''}
          aria-label="Pâtisserie film"
        />
      )}
      {!failed && (
        <button
          className="sf-film-control"
          onClick={toggle}
          disabled={!near || paused}
          aria-label={playing ? 'Pause campaign film' : 'Play campaign film'}
        >
          <span aria-hidden="true">{playing ? 'Ⅱ' : '▷'}</span>
          {playing ? 'Pause film' : 'Play film'}
        </button>
      )}
      {failed && (
        <figcaption className="sf-film-fallback">Enjoy the still</figcaption>
      )}
    </figure>
  );
}

const products = [
  {
    name: 'Lem',
    type: 'A little zest for your bedside.',
    image: '/assets/prod-lem.webp',
    url: 'https://hellonancy.com/products/lem',
  },
  {
    name: 'Avo',
    type: 'Your not-so-innocent avocado.',
    image: '/assets/prod-avo-clitoral-massager.webp',
    url: 'https://hellonancy.com/products/avo-clitoral-massager',
  },
  {
    name: 'Berri',
    type: 'Something worth taking your time over.',
    image: '/assets/prod-berri.webp',
    url: 'https://hellonancy.com/products/berri',
  },
];
function Favourites() {
  return (
    <section className="sf-favourites sf-section" id="favourites">
      <div className="sf-section-heading">
        <div>
          <p className="sf-eyebrow">THE FAMILIAR FAVOURITES</p>
          <h2>
            Good company.
            <br />
            <em>Very good intentions.</em>
          </h2>
        </div>
        <a
          href="https://hellonancy.com/collections/all"
          target="_blank"
          rel="noreferrer"
          className="sf-text-link"
        >
          Shop all Nancy <Arrow />
        </a>
      </div>
      <div className="sf-product-grid">
        {products.map((p) => (
          <a
            key={p.name}
            className="sf-product-card"
            href={p.url}
            target="_blank"
            rel="noreferrer"
          >
            <div className="sf-product-art">
              <img
                src={p.image}
                alt={`${p.name}, a Nancy pleasure product`}
                loading="lazy"
              />
              <span className="sf-card-arrow">
                <Arrow />
              </span>
            </div>
            <div className="sf-product-meta">
              <h3>{p.name}</h3>
              <span>Shop {p.name} ↗</span>
            </div>
            <p>{p.type}</p>
          </a>
        ))}
        <a className="sf-product-card sf-pudding-card" href={links.product}>
          <div className="sf-product-art">
            <span className="sf-small-label">FROM THE PÂTISSERIE</span>
            <img
              src={`${media}product.png`}
              alt="Original Nancy pudding design"
              loading="lazy"
            />
            <span className="sf-card-arrow">
              <Arrow />
            </span>
          </div>
          <div className="sf-product-meta">
            <h3>The Pudding</h3>
            <span>Meet the pudding ↗</span>
          </div>
          <p>A little sweet. A little trouble.</p>
        </a>
      </div>
    </section>
  );
}

function WorldsCards({ full = false }: { full?: boolean }) {
  return (
    <div className={'sf-world-grid' + (full ? ' sf-world-grid-full' : '')}>
      <article className="sf-world-card">
        <a className="sf-world-art" href={links.campaign}>
          <img
            src={`${media}scene-1.webp`}
            alt="Nancy Pâtisserie, an impossible dessert salon"
            loading="lazy"
          />
          <span className="sf-world-number">WORLD 02</span>
          <span className="sf-world-enter">
            Enter the Pâtisserie <Arrow />
          </span>
        </a>
        <div className="sf-world-meta">
          <h3>
            Nancy <em>Pâtisserie.</em>
          </h3>
          <p>
            A dessert salon.
            <br />
            With other intentions.
          </p>
        </div>
        {full && (
          <a className="sf-text-link" href={links.product}>
            Meet the house special <Arrow />
          </a>
        )}
      </article>
      <article className="sf-world-card sf-world-tennis">
        <a className="sf-world-art" href={tennis}>
          <img
            src="/tennis-world/match-off/085-poster.jpg"
            alt="A player in pink beside a surreal tennis net"
            loading="lazy"
          />
          <span className="sf-world-number">WORLD 01</span>
          <span className="sf-world-enter">
            Enter the tennis world <Arrow />
          </span>
        </a>
        <div className="sf-world-meta">
          <h3>
            Love <em>all.</em>
          </h3>
          <p>
            The match is off.
            <br />
            The pleasure is on.
          </p>
        </div>
        {full && (
          <a
            className="sf-text-link"
            href="https://hellonancy.com/products/ace-air-suction-massager"
            target="_blank"
            rel="noreferrer"
          >
            Meet Ace <Arrow />
          </a>
        )}
      </article>
    </div>
  );
}

function Homepage({ paused }: { paused: boolean }) {
  return (
    <main id="sf-main">
      <section className="sf-launch">
        <div className="sf-launch-copy">
          <p className="sf-eyebrow">
            <span className="sf-sun" aria-hidden="true">
              ✳
            </span>{' '}
            AN INVITATION FROM NANCY
          </p>
          <h1>
            Something
            <br />
            <em>sweet.</em>
            <br />
            For later.
          </h1>
          <p className="sf-launch-description">
            Step into Nancy Pâtisserie.
            <br />A dessert salon with other intentions.
          </p>
          <div className="sf-launch-actions">
            <LinkButton href={links.campaign}>Enter the Pâtisserie</LinkButton>
            <a className="sf-text-link" href={links.product}>
              Shop the pudding <Arrow />
            </a>
          </div>
          <div className="sf-launch-footer">
            <span>PLEASURE, À LA CARTE.</span>
            <span>THE NANCY IMAGINATION / 02</span>
          </div>
        </div>
        <div className="sf-launch-art">
          <HouseFilm scene={6} paused={paused} />
          <span className="sf-art-caption">
            THE HOUSE SPECIAL.
            <br />
            DESSERT-SHAPED. NOT EDIBLE.
          </span>
        </div>
      </section>
      <div className="sf-brand-line">
        <span>A little curiosity.</span>
        <span>A little mischief.</span>
        <span>A lot of Nancy.</span>
      </div>
      <Favourites />
      <section className="sf-worlds-section sf-section">
        <div className="sf-section-heading">
          <div>
            <p className="sf-eyebrow">FROM THE NANCY IMAGINATION</p>
            <h2>
              Different worlds.
              <br />
              <em>Same appetite.</em>
            </h2>
          </div>
          <a className="sf-text-link" href={links.worlds}>
            Step into Nancy Worlds <Arrow />
          </a>
        </div>
        <WorldsCards />
      </section>
      <section className="sf-about">
        <p className="sf-eyebrow">HI. WE’RE NANCY.</p>
        <h2>
          Pleasure deserves
          <br />
          <em>a little personality.</em>
        </h2>
        <p>
          Objects to get curious about. Stories to get lost in.
          <br />
          And a little more room for you.
        </p>
        <LinkButton
          href="https://hellonancy.com/pages/about-us"
          external
          secondary
        >
          Get to know Nancy
        </LinkButton>
      </section>
    </main>
  );
}

function Worlds() {
  return (
    <main id="sf-main" className="sf-worlds-page sf-section">
      <div className="sf-worlds-intro">
        <p className="sf-eyebrow">A NANCY WORLD IS A STATE OF MIND</p>
        <h1>
          Follow your
          <br />
          <em>curiosity.</em>
        </h1>
        <div className="sf-worlds-aside">
          <span>
            02 WORLDS.
            <br />
            ONE VERY PLAYFUL IMAGINATION.
          </span>
          <p>
            A court where the rules unravel.
            <br />A pâtisserie that stays open for pleasure.
            <br />
            Choose somewhere you’d rather be.
          </p>
        </div>
      </div>
      <WorldsCards full />
      <div className="sf-worlds-ending">
        <p>Take the feeling home.</p>
        <a href={links.home + '#favourites'} className="sf-text-link">
          Meet the Nancy collection <Arrow />
        </a>
      </div>
    </main>
  );
}

function Product({
  onSignup,
  paused,
}: {
  onSignup: () => void;
  paused: boolean;
}) {
  const [view, setView] = useState(0);
  const views = [
    {
      image: 'product.png',
      label: 'Front view',
      alt: 'Original Nancy pudding product render, front view',
    },
    {
      image: 'product-back.jpg',
      label: 'Back view',
      alt: 'Original Nancy pudding product render, back view',
    },
    {
      image: 'scene-5.webp',
      label: 'Campaign view',
      alt: 'Imagined Nancy gift presentation in the dessert salon',
    },
  ];
  return (
    <main id="sf-main" className="sf-product-page">
      <nav className="sf-breadcrumb" aria-label="Breadcrumb">
        <a href={links.home}>Nancy</a>
        <span>/</span>
        <a href={links.campaign}>Pâtisserie</a>
        <span>/</span>
        <span>The Pudding</span>
      </nav>
      <section className="sf-pdp">
        <div className="sf-pdp-gallery">
          <div
            className={
              'sf-pdp-image ' +
              (view === 2
                ? 'sf-campaign-view'
                : view === 1
                  ? 'sf-back-view'
                  : '')
            }
          >
            <img src={media + views[view].image} alt={views[view].alt} />
            <span className="sf-small-label">
              {view === 2
                ? 'THE CAMPAIGN IMAGINATION'
                : 'THE ORIGINAL PRODUCT DESIGN'}
            </span>
          </div>
          <fieldset className="sf-gallery-tabs">
            <legend className="sf-visually-hidden">Product images</legend>
            {views.map((v, i) => (
              <button
                key={v.label}
                onClick={() => setView(i)}
                aria-pressed={view === i}
              >
                <img src={media + v.image} alt="" />
                {v.label}
              </button>
            ))}
          </fieldset>
        </div>
        <div className="sf-pdp-copy">
          <p className="sf-eyebrow">NANCY PÂTISSERIE / THE HOUSE SPECIAL</p>
          <h1>
            The <em>Pudding.</em>
          </h1>
          <p className="sf-pdp-subhead">
            A little sweet.
            <br />A little trouble.
          </p>
          <p>
            A mint fluted base. A cream swirl. One very knowing cherry. A
            dessert-shaped pleasure object with a place on your bedside.
          </p>
          <span className="sf-colour">
            <span /> Mint / cream / cherry
          </span>
          <div className="sf-availability">
            <span>PRELAUNCH PAGE CONCEPT</span>
            <p>Price and launch date to be announced.</p>
          </div>
          <button className="sf-button sf-wide" onClick={onSignup}>
            Join the guest list <Arrow />
          </button>
          <p className="sf-demo-caption">
            Try the signup preview. No information is sent or saved.
          </p>
          <a href={links.campaign} className="sf-text-link">
            Take a look inside the Pâtisserie <Arrow />
          </a>
          <div className="sf-details">
            <details open>
              <summary>
                The design <span>+</span>
              </summary>
              <p>
                Our original pudding design, shown from the front and back. The
                salon and gift-box scenes are campaign interpretations.
              </p>
            </details>
            <details>
              <summary>
                Launch & availability <span>+</span>
              </summary>
              <p>
                This is a proposed product-page experience. Final pricing,
                specifications, availability and shipping details will be added
                before launch. No purchase is available here.
              </p>
            </details>
            <details>
              <summary>
                A little note from the house <span>+</span>
              </summary>
              <p>
                Inspired by dessert. Designed for pleasure. The pudding is not
                edible.
              </p>
            </details>
          </div>
        </div>
      </section>
      <section className="sf-pdp-story">
        <HouseFilm scene={2} paused={paused} />
        <div>
          <p className="sf-eyebrow">THERE’S A WHOLE WORLD BEHIND IT.</p>
          <h2>
            Your evening.
            <br />
            <em>On a silver platter.</em>
          </h2>
          <LinkButton href={links.campaign} secondary>
            Enter the Pâtisserie
          </LinkButton>
        </div>
      </section>
    </main>
  );
}

function Footer() {
  return (
    <footer className="sf-footer">
      <div className="sf-footer-top">
        <a href={links.home} className="sf-brand" aria-label="Nancy homepage">
          <img src="/assets/nancy-logo.png" alt="Nancy" />
        </a>
        <p>
          Good things happen
          <br />
          <em>when you get curious.</em>
        </p>
        <nav aria-label="Footer">
          <a href={links.worlds}>Nancy Worlds</a>
          <a
            href="https://hellonancy.com/collections/all"
            target="_blank"
            rel="noreferrer"
          >
            Shop Nancy ↗
          </a>
          <a
            href="https://hellonancy.com/pages/about-us"
            target="_blank"
            rel="noreferrer"
          >
            About us ↗
          </a>
        </nav>
      </div>
      <div className="sf-footer-bottom">
        <span>A NANCY IMAGINATION.</span>
        <span>
          Store integration preview · No checkout or signup is connected.
        </span>
        <a href="https://hellonancy.com/" target="_blank" rel="noreferrer">
          Visit the live store ↗
        </a>
      </div>
    </footer>
  );
}

function Overlay({
  kind,
  close,
}: {
  kind: 'notes' | 'signup';
  close: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    const opener = document.activeElement as HTMLElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog.current?.showModal();
    return () => {
      document.body.style.overflow = previousOverflow;
      opener?.focus();
    };
  }, []);
  useEffect(() => {
    if (done)
      dialog.current
        ?.querySelector<HTMLButtonElement>('[data-confirm]')
        ?.focus();
  }, [done]);
  function submit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const value = data.get('email');
    const email = typeof value === 'string' ? value.trim() : '';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Enter a valid email address to try the preview.');
      return;
    }
    e.currentTarget.reset();
    setDone(true);
    setError('');
  }
  const note = notes[route];
  return (
    <dialog
      ref={dialog}
      className="sf-dialog"
      onCancel={close}
      onClose={close}
      aria-labelledby="sf-dialog-title"
    >
      <button
        className="sf-dialog-close"
        onClick={close}
        aria-label="Close dialog"
      >
        ×
      </button>
      {kind === 'notes' ? (
        <>
          <p className="sf-eyebrow">THE INTEGRATION / {note.number}</p>
          <h2 id="sf-dialog-title">{note.title}</h2>
          <p>{note.body}</p>
          <ol>
            {note.steps.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ol>
          <div className="sf-proposed-path">
            <span>PROPOSED STORE ADDRESS</span>
            <code>{note.path}</code>
          </div>
          <p className="sf-demo-caption">
            This working preview is separate from your Shopify store. The live
            store has not been changed.
          </p>
        </>
      ) : done ? (
        <>
          <p className="sf-eyebrow">GUEST LIST PREVIEW</p>
          <h2 id="sf-dialog-title">
            A place
            <br />
            <em>for you.</em>
          </h2>
          <output className="sf-signup-result">
            <p>That’s the proposed confirmation experience.</p>
            <p>
              This was a demo. Your email hasn’t been saved, submitted or
              subscribed.
            </p>
          </output>
          <button className="sf-button" onClick={close} data-confirm>
            Back to the pudding <Arrow />
          </button>
        </>
      ) : (
        <>
          <p className="sf-eyebrow">THE PÂTISSERIE GUEST LIST</p>
          <h2 id="sf-dialog-title">
            Save a little
            <br />
            <em>room for us.</em>
          </h2>
          <p>Be first to hear when the house special arrives.</p>
          <form onSubmit={submit} noValidate>
            <label htmlFor="guest-email">Email address</label>
            <input
              id="guest-email"
              name="email"
              type="email"
              autoComplete="off"
              placeholder="you@example.com"
              aria-invalid={!!error}
              aria-describedby="signup-demo signup-error"
              onChange={() => setError('')}
            />
            <p id="signup-error" className="sf-form-error" role="alert">
              {error}
            </p>
            <button className="sf-button sf-wide" type="submit">
              Preview signup <Arrow />
            </button>
            <p id="signup-demo" className="sf-demo-caption">
              Demonstration only. Use a sample email. Nothing is sent or saved,
              and no subscription is created.
            </p>
          </form>
        </>
      )}
    </dialog>
  );
}

function App() {
  const [menu, setMenu] = useState(false);
  const [overlay, setOverlay] = useState<'notes' | 'signup' | null>(null);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenu(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  return (
    <div className={'sf sf-route-' + route} data-overlay={!!overlay}>
      <a
        href={route === 'campaign' ? '#the-pudding' : '#sf-main'}
        className="sf-skip"
      >
        Skip to content
      </a>
      <PreviewBar onNotes={() => setOverlay('notes')} />
      <Header menu={menu} onMenu={() => setMenu(!menu)} />
      {route === 'home' ? (
        <Homepage paused={!!overlay || menu} />
      ) : route === 'worlds' ? (
        <Worlds />
      ) : route === 'product' ? (
        <Product
          onSignup={() => setOverlay('signup')}
          paused={!!overlay || menu}
        />
      ) : (
        <>
          <Suspense
            fallback={<div className="sf-boot">Setting your place…</div>}
          >
            <Patisserie externalPaused={!!overlay || menu} />
          </Suspense>
          <aside
            className="sf-campaign-bridge"
            aria-label="Meet the campaign product"
          >
            <img src={`${media}product.png`} alt="" />
            <div>
              <span>THE HOUSE SPECIAL</span>
              <strong>The Pudding</strong>
            </div>
            <a className="sf-button" href={links.product}>
              Meet the pudding <Arrow />
            </a>
          </aside>
        </>
      )}
      {route !== 'campaign' && <Footer />}
      {overlay && <Overlay kind={overlay} close={() => setOverlay(null)} />}
    </div>
  );
}
createRoot(document.getElementById('root')!).render(<App />);
