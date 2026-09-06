'use client';

/* oxlint-disable next/no-img-element -- These local art plates use native image refs and explicit dimensions/loading; no remote image optimizer is configured. */
import { useState } from 'react';

const beats = [
  { time:'00—03', title:'The anticipation', image:'embrace.png', copy:'A quiet architectural wide. The two monumental balls hold their distance. One ordinary ball gives us the scale.', sound:'A solitary bounce, then space.' },
  { time:'03—06', title:'A little give', image:'embrace.png', copy:'A dedicated close-up of the net tape, gradually yielding. The wide here is the reference for the planned detail shot.', sound:'A fine thread creak.' },
  { time:'06—10', title:'The contact', image:'contact.png', copy:'Pink and optic lime meet. Felt fibers catch the light. A modest compression makes the moment feel physical.', sound:'A soft brush of felt.' },
  { time:'10—13', title:'Stay here', image:'embrace.png', copy:'Return to the wide. Hold the embrace. No cutaway, no new spectacle. Give the audience time to look.', sound:'Air, and a little silence.' },
  { time:'13—15', title:'LOVE ALL', image:null, copy:'A Nancy Tennis Club. Pleasure is the point. Typography is added in the edit so the identity stays exact.', sound:'One clean club bell.' },
];

export function MotionTreatment() {
  const [active,setActive] = useState(0);
  const beat = beats[active];
  return <div className="tw-treatment">
    <div className="tw-beat-controls" aria-label="Campaign storyboard beats">{beats.map((item,index)=><button key={item.time} type="button" aria-pressed={active===index} onClick={()=>setActive(index)}><span>{item.time}s</span><span>{item.title}</span></button>)}</div>
    <div className="tw-beat-layout"><div className="tw-beat-image">{beat.image?<img key={beat.image} src={`/tennis-world/${beat.image}`} width="1536" height="1024" alt={`Concept reference for ${beat.title.toLowerCase()}`} loading="lazy" />:<div className="tw-endcard"><span>A Nancy Tennis Club</span><strong>LOVE<br />ALL</strong><span>Pleasure is the point.</span></div>}<span className="tw-frame-stamp">{beat.time}s / Frame direction</span></div><div className="tw-beat-copy" aria-live="polite"><span>0{active+1} / Five beats</span><h3>{beat.title}</h3><p>{beat.copy}</p><div><span>Sound direction</span><p>{beat.sound}</p></div><small>Original campaign storyboard. The exhibition now features three eight-second Higgsfield installation films. <a href="/tennis-world/asset-ledger.md" download>Asset and motion notes ↗</a></small></div></div>
  </div>;
}
