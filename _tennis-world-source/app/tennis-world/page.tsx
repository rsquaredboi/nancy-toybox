/* oxlint-disable next/no-html-link-for-pages -- Preserve native document navigation in this Vinext preview; prebundled Next Link caused an incompatible React hook call. */
/* oxlint-disable next/no-img-element -- These local art plates use native image refs and explicit dimensions/loading; no remote image optimizer is configured. */
import type { Metadata } from 'next';
import { Reveal } from '@/components/cinema';
import { MotionTreatment } from './treatment';
import { TennisArrival } from './tennis-arrival';
import { RallyCourt } from './color-world';
import { SoftExhibition, SoftHero, ExhibitionIndex, FilmRoom, SoftMarquee, MotionToggle } from './soft-machines';
import './tennis-world.css';
import './motion.css';
import './color-world.css';
import './soft-machines.css';

export const metadata: Metadata = {
  title: 'LOVE ALL — A Nancy Tennis Club',
  description: 'Pleasure is the point. A creative world for Nancy’s tennis collection.',
  robots: { index: false, follow: false },
};

const collection = 'https://hellonancy.com/collections/tennis-collection-limited-edition';

export default function TennisWorld() {
  return <SoftExhibition><TennisArrival><div className="tw-world">
    <a className="skip-link" href="#tw-main">Skip to the exhibition</a>
    <header className="tw-header" id="tw-top">
      <a href="/" aria-label="Nancy homepage" className="tw-logo"><img src="/assets/nancy-logo.png" alt="Nancy" width="440" height="161" /></a>
      <nav className="tw-edition" aria-label="Explore the tennis club"><a href="#the-idea">The exhibition</a><a href="#equipment">The collection</a><a href="#clubhouse">The clubhouse</a></nav>
      <div className="sm-header-actions"><MotionToggle /><a href={collection} target="_blank" rel="noreferrer" className="tw-nav-link">Shop Nancy <span aria-hidden="true">↗</span></a></div>
    </header>
    <main id="tw-main" tabIndex={-1}>
      <SoftHero />
      <ExhibitionIndex />
      <FilmRoom scene="unravelling" />
      <SoftMarquee />

      <section className="tw-equipment tw-wrap" id="equipment">
        <div className="tw-section-head"><Reveal><span className="tw-kicker">THE COLLECTION / OBJECTS OF AFFECTION</span><h2>Take the feeling<br /><em>home with you.</em></h2></Reveal><Reveal><p>For the love of the game.<br />And everything after it.</p><a href={collection} target="_blank" rel="noreferrer" className="tw-line-link">Find your new favorite ↗</a></Reveal></div>
        <div className="tw-product-grid">
          <Reveal><a className="tw-product" href="https://hellonancy.com/products/ace-air-suction-massager" target="_blank" rel="noreferrer"><div className="tw-product-image"><img src="/tennis-world/ace-official.png" alt="Official Nancy Ace packaging in pink and tennis green beside a bowl of pink tennis balls" width="2048" height="2048" loading="lazy" /></div><div className="tw-product-title"><h3>Ace</h3><span>01 / Air suction massager ↗</span></div><p>A compact tennis-ball form. A different kind of serve.</p></a></Reveal>
          <Reveal delay={100}><a className="tw-product" href="https://hellonancy.com/products/smash-wand-vibrator" target="_blank" rel="noreferrer"><div className="tw-product-image"><img src="/tennis-world/smash-official.png" alt="Official Nancy Smash wand with lime tennis-ball head and pale green handle in its striped presentation box" width="2048" height="2048" loading="lazy" /></div><div className="tw-product-title"><h3>Smash</h3><span>02 / External wand ↗</span></div><p>A tennis-ball head. A pleasure-first power play.</p></a></Reveal>
        </div>
        <p className="tw-director-note"><span>Director’s note</span>These are the real products and existing packaging. The next photography pass places them inside the world while preserving every seam, control, color, and proportion.</p>
      </section>

      <FilmRoom scene="day-off" />
      <RallyCourt />

      <details className="tw-creative-notes" id="creative-notes"><summary><span>Behind the club</span><span>The direction, materials & film treatment <b aria-hidden="true">+</b></span></summary>
      <section className="tw-system tw-wrap" id="the-system"><div className="tw-section-head"><Reveal><span className="tw-kicker">04 / The grammar</span><h2>One strange thing.<br /><em>Everything else, exact.</em></h2></Reveal><p>One impossible physical gesture per scene. The light, architecture, weight, and materials do the rest.</p></div><div className="tw-swatches">{[['Electric','263ECC'],['Daydream','F6A0C6'],['Optic','E5F54A'],['Chalk','FFF3E8']].map(([name,color])=><div key={name} style={{backgroundColor:`#${color}`,color:name==='Electric'?'#f9accf':'#26358a'}}><span>{name}</span><span>#{color}</span></div>)}</div><div className="tw-rules"><p><span>Light</span>Afternoon sun.<br />Honest shadows.</p><p><span>Material</span>Felt and silicone.<br />A line of chrome.</p><p><span>Camera</span>Architecture wide.<br />Feeling close.</p><p><span>Movement</span>Anticipation.<br />Contact. Hold.</p></div></section>

      <section className="tw-film" id="motion"><div className="tw-wrap"><div className="tw-section-head"><Reveal><span className="tw-kicker">05 / The film treatment</span><h2>The point<br /><em>is the feeling.</em></h2></Reveal><div><p>A 15-second campaign in five beats.<br />Select a beat to explore the direction.</p><span className="tw-small-label">Interactive storyboard · still frames</span></div></div><MotionTreatment /></div></section>

      <section className="tw-strategy tw-wrap" id="strategy"><Reveal className="tw-section-head"><div><span className="tw-kicker">06 / From campaign to world</span><h2>The collection exists.<br /><em>Now give it a place.</em></h2></div></Reveal><div className="tw-strategy-grid"><article><span>What I found</span><h3>The seed is already Nancy.</h3><p>The live site leads with tennis, then returns to general bestsellers before introducing the tennis collection again. Its packaging already says love means everything. The opportunity is a continuous story.</p><a href="https://hellonancy.com/" target="_blank" rel="noreferrer">Live site reviewed ↗</a></article><article><span>The creative move</span><h3>A world you can recognize.</h3><p>One signature sculpture connects the campaign, the website, and a possible physical installation. Product objects make that world something a customer can take home.</p><a href="https://www.gentlemonster.com/legacy/story/en/jentle-salon.html" target="_blank" rel="noreferrer">Reference: Jentle Salon ↗</a></article><article><span>The commercial move</span><h3>Make desire easy to act on.</h3><p>Open with the spectacle, then show Ace and Smash immediately. Keep shopping visible, education useful, and support clear. Let the customer choose how far to explore.</p><a href="/tennis-world/creative-direction.md" download>Read the complete treatment ↓</a></article></div></section>

      </details>
      <section className="tw-close"><span>A NANCY UNIVERSE PRODUCTION</span><p>Nothing to prove.<br /><em>Everything to feel.</em></p><a href="#tw-top">Back to Center Court ↑</a></section>
    </main>
    <footer className="tw-footer tw-wrap"><span>LOVE ALL / Creative direction, September 2026</span><span>Independent Nancy concept. No actual Gentle Monster collaboration.</span><a href="/">Original local homepage ↗</a></footer>
  </div></TennisArrival></SoftExhibition>;
}
