'use client';

/* oxlint-disable next/no-img-element -- These local art plates use native image refs and explicit dimensions/loading; no remote image optimizer is configured. */

import { useEffect, useRef, useState, type CSSProperties } from 'react';

const collection = 'https://hellonancy.com/collections/tennis-collection-limited-edition';
const scenes = [
  { top:'Welcome to Center Court', lines:['LOVE','ALL'], sentence:'Pleasure is the point.', chapter:0 },
  { top:'A little anticipation', lines:['FEEL','EVERYTHING.'], sentence:'Even the space between.', chapter:1 },
  { top:'Come a little closer', lines:['SOFT','SPOT.'], sentence:'Some things are better felt.', chapter:1 },
  { top:'The official is off duty', lines:['NO','PRESSURE.'], sentence:'Nobody is keeping score.', chapter:2 },
];
const chapters = [{name:'Center Court',time:0,seek:0,end:6.6},{name:'A closer look',time:6.6,seek:7.05,end:14},{name:'The Clubhouse',time:14,seek:14.45,end:20.8}];

function PauseIcon({ playing }: {playing:boolean}) {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">{playing?<><path d="M5 3v10M11 3v10" stroke="currentColor" strokeWidth="1.5" /></>:<path d="m5 3 8 5-8 5V3Z" fill="currentColor" />}</svg>;
}

export function CinematicOpening() {
  const root = useRef<HTMLElement>(null);
  const film = useRef<HTMLVideoElement>(null);
  const bars = useRef<(HTMLSpanElement|null)[]>([]);
  const clock = useRef<HTMLOutputElement>(null);
  const previousScene = useRef(0);
  const pendingSeek = useRef<number|null>(null);
  const [scene,setScene] = useState(0);
  const [playing,setPlaying] = useState(false);
  const [ready,setReady] = useState(false);
  const [unavailable,setUnavailable] = useState(false);
  const [pausedByUser,setPausedByUser] = useState(false);
  const [manualPlay,setManualPlay] = useState(false);
  const [sound,setSound] = useState(false);
  const [sourceRevision,setSourceRevision] = useState(0);

  useEffect(()=>{
    const breakpoint=window.matchMedia('(max-width:767px)');
    const updateSource=()=>{
      const video=film.current;
      if(!video) return;
      pendingSeek.current=video.currentTime;
      setReady(false);
      setUnavailable(false);
      video.load();
      setSourceRevision(value=>value+1);
    };
    breakpoint.addEventListener('change',updateSource);
    return()=>breakpoint.removeEventListener('change',updateSource);
  },[]);

  useEffect(()=>{
    const video=film.current;
    if(!video) return;
    const preference=window.matchMedia('(prefers-reduced-motion: reduce)');
    let visible=true;
    let active=true;
    const sync=()=>{
      if(!visible || document.hidden || pausedByUser || (preference.matches && !manualPlay)) video.pause();
      else void video.play().catch(()=>{if(active && video.paused)setPlaying(false);});
    };
    const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;sync();},{threshold:.1});
    if(root.current) observer.observe(root.current);
    document.addEventListener('visibilitychange',sync);
    preference.addEventListener('change',sync);
    sync();
    return()=>{active=false;observer.disconnect();document.removeEventListener('visibilitychange',sync);preference.removeEventListener('change',sync);video.pause();};
  },[pausedByUser,manualPlay,sourceRevision]);

  function updateTime() {
    const video=film.current;
    if(!video) return;
    const time=video.currentTime;
    const next=time<6.6 || time>=18.2 ? 0 : time<9.8 ? 1 : time<14 ? 2 : 3;
    if(next!==previousScene.current){previousScene.current=next;setScene(next);}
    for(let index=0;index<chapters.length;index++){
      const chapter=chapters[index];
      const progress=Math.max(0,Math.min(1,(time-chapter.time)/(chapter.end-chapter.time)));
      bars.current[index]?.style.setProperty('transform',`scaleX(${progress})`);
    }
    if(clock.current) clock.current.textContent=`00:${Math.floor(time).toString().padStart(2,'0')} / 00:21`;
  }

  function togglePlayback() {
    const video=film.current;
    if(!video) return;
    if(!video.paused){setPausedByUser(true);video.pause();}
    else {setManualPlay(true);setPausedByUser(false);void video.play().catch(()=>setPlaying(false));}
  }

  function toggleSound() {
    const video=film.current;
    if(!video) return;
    const next=!sound;
    video.muted=!next;
    video.volume=.55;
    setSound(next);
  }

  function seek(time:number) {
    const video=film.current;
    if(!video || unavailable) return;
    if(video.readyState>=1){video.currentTime=time;updateTime();}
    else {pendingSeek.current=time;video.load();}
  }

  const current=scenes[scene];
  return <section className={`tw-cinema ${ready && !unavailable?'tw-film-ready':''} ${playing?'tw-is-playing':'tw-is-paused'}`} ref={root} id="center-court" aria-labelledby="tw-title">
    <picture className="tw-cinema-poster"><source media="(max-width:767px)" srcSet="/tennis-world/films/poster-portrait.jpg" /><img src="/tennis-world/films/poster-landscape.jpg" alt="Monumental pink and lime tennis balls lean together in a sunlit pink court, with a net between them" width="1600" height="900" fetchPriority="high" /></picture>
    <video ref={film} className="tw-cinema-video" muted loop playsInline preload="metadata" poster="/tennis-world/films/poster-landscape.jpg" aria-label="LOVE ALL motion edit: Center Court, tactile felt details, and the sculptural clubhouse" onLoadedData={()=>{setReady(true);setUnavailable(false);}} onLoadedMetadata={()=>{if(pendingSeek.current!==null && film.current){film.current.currentTime=pendingSeek.current;pendingSeek.current=null;}}} onTimeUpdate={updateTime} onPlay={()=>setPlaying(true)} onPause={()=>setPlaying(false)} onError={()=>{if(film.current?.error){setUnavailable(true);setPlaying(false);setSound(false);}}}>
      <source src="/tennis-world/films/love-all-portrait.mp4" media="(max-width:767px)" type="video/mp4" />
      <source src="/tennis-world/films/love-all-landscape.mp4" type="video/mp4" />
    </video>
    <div className="tw-cinema-shade" aria-hidden="true" />
    <div className="tw-cinema-top"><span>A Nancy Tennis Club</span><div className="tw-live-caption" key={current.top}><span className="tw-live-mark" aria-hidden="true" />{current.top}</div><span>Play for the feeling.</span></div>
    <div className="tw-cinema-content">
      <div className="tw-cinema-titles" key={scene}><p className="tw-cinema-overline">{current.sentence}</p><h1 id="tw-title" aria-label="LOVE ALL — A Nancy Tennis Club">{current.lines.map((line,lineIndex)=><span className={`tw-type-line ${line.length>8?'tw-type-long':''}`} key={line} aria-hidden="true">{line.split('').map((letter,index)=><span className="tw-type-letter" key={`${index}-${letter}`} style={{'--letter-delay':`${(index+lineIndex*3)*28}ms`} as CSSProperties}>{letter}</span>)}</span>)}</h1></div>
      <div className="tw-cinema-invitation"><p>A place to play.<br />Nothing to prove.</p><a href={collection} target="_blank" rel="noreferrer" className="tw-court-link"><span>Shop the<br />tennis collection</span><svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14" stroke="currentColor" strokeWidth="1.5" /></svg></a></div>
    </div>
    <div className="tw-cinema-bottom"><div className="tw-chapter-nav" aria-label="Film chapters">{chapters.map((chapter,index)=><button type="button" key={chapter.name} aria-pressed={current.chapter===index} onClick={()=>seek(chapter.seek)} disabled={unavailable}><span className="tw-chapter-label"><span>0{index+1}</span>{chapter.name}</span><span className="tw-chapter-track"><span ref={element=>{bars.current[index]=element;}} /></span></button>)}</div><div className="tw-playback"><output ref={clock} aria-label="Film running time" className="tw-film-time">00:00 / 00:21</output><button type="button" onClick={toggleSound} disabled={unavailable} aria-pressed={sound} aria-label={sound?'Mute film sound':'Enable film sound'} className="tw-sound-control"><span className="tw-sound-bars" aria-hidden="true"><i/><i/><i/><i/></span><span>Sound {sound?'on':'off'}</span></button><button type="button" onClick={togglePlayback} disabled={unavailable} aria-label={playing?'Pause opening film':'Play opening film'} className="tw-pause-control"><PauseIcon playing={playing}/><span>{unavailable?'Still view':playing?'Pause':'Play'}</span></button></div></div>
    <a href="#the-idea" className="tw-scroll-invitation">Step inside <span aria-hidden="true">↓</span></a>
  </section>;
}

export function TactileStudy() {
  const photo=useRef<HTMLImageElement>(null);
  const animation=useRef<Animation|null>(null);
  const [held,setHeld]=useState(false);
  useEffect(()=>()=>animation.current?.cancel(),[]);
  function change(pressed:boolean){
    setHeld(pressed);
    const image=photo.current;
    if(!image) return;
    const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const start=getComputedStyle(image).transform;
    animation.current?.cancel();
    animation.current=image.animate([{transform:start},{transform:pressed?'scale(1.34) translate(-2%, 1%)':'scale(1) translate(0, 0)'}],{duration:reduce?0:pressed?1500:1900,easing:'cubic-bezier(.16,1,.3,1)',fill:'forwards'});
  }
  return <section className={`tw-tactile ${held?'is-held':''}`} aria-label="Explore the texture of LOVE ALL"><img ref={photo} src="/tennis-world/contact.png" width="1536" height="1024" loading="lazy" alt="A detailed study of pink and lime felt meeting along a chalk-colored tennis seam" /><div className="tw-tactile-veil"/><div className="tw-tactile-top"><span>A closer look</span><span>Felt. Tension. A little give.</span></div><div className="tw-tactile-type"><span>Find your</span><p>soft <em>spot.</em></p></div><button type="button" className="tw-hold-control" aria-pressed={held} onPointerDown={event=>{event.currentTarget.setPointerCapture(event.pointerId);change(true);}} onPointerUp={()=>change(false)} onPointerCancel={()=>change(false)} onLostPointerCapture={()=>{if(held)change(false);}} onKeyDown={event=>{if((event.key===' '||event.key==='Enter')&&!event.repeat){event.preventDefault();change(true);}}} onKeyUp={event=>{if(event.key===' '||event.key==='Enter'){event.preventDefault();change(false);}}} onBlur={()=>{if(held)change(false);}}><span className="tw-hold-ring" aria-hidden="true"/><span>{held?'Stay a little longer.':'Hold for a closer look'}</span></button></section>;
}
