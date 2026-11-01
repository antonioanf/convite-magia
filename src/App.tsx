import { useCallback, useEffect, useId, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { gsap } from 'gsap';
import confetti from 'canvas-confetti';
import { convite, type InviteConfig, type MagicalTitle, type MedalId, type SceneBackground, type SceneId, type SceneImageLayers, type SceneLight } from './config/convite';
import { MagicCanvas } from './MagicCanvas';

type SheetId = MedalId | null;
type OpeningScene = Exclude<SceneId, 'invitation'>;

const sceneOrder: OpeningScene[] = ['castle', 'book', 'envelope', 'map', 'reveal'];
const sceneHints: Record<OpeningScene, string> = {
  castle: 'Toque para entrar na Academia',
  book: 'Toque para abrir',
  envelope: 'Toque no selo para descobrir',
  map: 'Toque para seguir a trilha mágica',
  reveal: 'Arraste a varinha para revelar o convite',
};

function imageLayers(background?: SceneBackground): SceneImageLayers {
  if (typeof background === 'string') return { background };
  return background ?? {};
}

function vibrate(pattern: number | number[] = 35) {
  if ('vibrate' in navigator) navigator.vibrate(pattern);
}

function deterministicTitle(name: string, titles: MagicalTitle[]) {
  let hash = 0;
  for (const character of name.trim().toLocaleLowerCase('pt-BR')) {
    hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  }
  return titles[hash % titles.length];
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Fortaleza' }).format(date);
}

function makeCalendarFile(config: InviteConfig) {
  const start = new Date(config.dateTime);
  const end = new Date(start.getTime() + 3 * 60 * 60 * 1000);
  const stamp = (date: Date) => date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const escape = (value: string) => value.replace(/\\/g, '\\\\').replace(/,/g, '\\,').replace(/;/g, '\\;').replace(/\n/g, '\\n');
  return [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Convite Magico//PT-BR',
    'BEGIN:VEVENT', `UID:${encodeURIComponent(config.name)}-${stamp(start)}@convite-magico`,
    `DTSTAMP:${stamp(new Date())}`, `DTSTART:${stamp(start)}`, `DTEND:${stamp(end)}`,
    `SUMMARY:${escape(`${config.age} anos de ${config.name}`)}`,
    `LOCATION:${escape(`${config.venue}, ${config.address}`)}`,
    `DESCRIPTION:${escape(config.phrase)}`, 'END:VEVENT', 'END:VCALENDAR',
  ].join('\r\n');
}

function Icon({ name }: { name: string }) {
  const paths: Record<string, ReactNode> = {
    star: <path d="m12 2 2.7 6.1 6.6.6-5 4.4 1.5 6.4L12 16l-5.8 3.5 1.5-6.4-5-4.4 6.6-.6L12 2Z" />,
    potion: <><path d="M9 3h6m-5 0v5l-4.2 7.3A4 4 0 0 0 9.3 21h5.4a4 4 0 0 0 3.5-5.7L14 8V3" /><path d="M8 15h8" /></>,
    map: <><path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3V6Z" /><path d="M9 3v15m6-12v15" /></>,
    rsvp: <><path d="M20 6 9 17l-5-5" /><path d="M21 12v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h10" /></>,
    dress: <><path d="m12 3 4 2 3 3-2 3-2-1v11H9V10l-2 1-2-3 3-3 4-2Z" /><path d="M9 5a3 3 0 0 0 6 0" /></>,
    gifts: <><path d="M20 12v9H4v-9m-2-5h20v5H2zm10 0v14" /><path d="M12 7H7.5a2.5 2.5 0 1 1 2.5-2c0 1 2 2 2 2Zm0 0h4.5a2.5 2.5 0 1 0-2.5-2c0 1-2 2-2 2Z" /></>,
    hat: <><path d="M4 20c4-7 6-13 9-17 1 6 4 12 7 17H4Z" /><path d="M3 20h18M7 17h10" /></>,
    close: <><path d="m18 6-12 12M6 6l12 12" /></>,
    music: <><path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /></>,
    copy: <><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3" /></>,
    dragon: <><path d="M4 17c0-4 3-7 7-7h4l4-4 1 5 2 2-3 2-1 4-4-1-2 2-3-3H5" /><path d="m9 10-2-4 5 2m4 2h.01M7 16l-3 2m10-1 2 4" /></>,
    bubble: <><circle cx="8" cy="9" r="5" /><circle cx="17" cy="7" r="3" /><circle cx="16" cy="17" r="4" /><path d="m5 5 1-1m11 10 1-1" /></>,
    unicorn: <><path d="m7 11 2-4 4 2 4-2 2 5-2 7H9l-3-4Z" /><path d="m12 9 2-7 3 8M9 8 7 4m3 11h.01m5 0h.01m-4 3q2 2 4 0M6 12 3 10m15 2 3-2" /></>,
    cake: <><path d="M4 12h16v8H4zm-2 0c0-2 2-3 4-2 2-3 5-3 7 0 2-2 6-1 7 2" /><path d="M8 5v3m4-5v4m4-2v3" /><path d="m7 16 2 1m3-1 2 1m3-1 1 1" /></>,
    shirt: <><path d="m8 5 4-2 4 2 4 4-3 3-2-2v11H9V10l-2 2-3-3 4-4Z" /><path d="M9 5a3 3 0 0 0 6 0" /></>,
    shoe: <><path d="M3 16c3 0 5-2 6-6l4 4 6 2c2 1 3 2 3 4H3z" /><path d="m10 11 2 2m2-1 2 2m-11 3h15" /></>,
    toy: <><circle cx="12" cy="12" r="9" /><path d="M3.5 9h17M4 15h16m-8-12v18M8 4l8 16m0-16L8 20" /></>,
    book: <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v17H6.5A2.5 2.5 0 0 0 4 22zm0 0V22" /><path d="M8 7h8m-8 4h8" /></>,
  };
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name] ?? paths.star}</svg>;
}

function Candle({ className = '' }: { className?: string }) {
  return <div className={`candle ${className}`} aria-hidden="true"><i /><b /></div>;
}

function Library({ images, reduced = false, scene, lights = [], children }: {
  images?: SceneImageLayers;
  reduced?: boolean;
  scene: SceneId;
  lights?: SceneLight[];
  children: ReactNode;
}) {
  return (
    <div className={`library-scene ${reduced ? 'is-low-performance' : ''}`} data-scene={scene}>
      {images?.background && <div className="scene-image image-background" style={{ backgroundImage: `url("${images.background}")` }} />}
      {images?.middle && <div className="scene-image image-middle" style={{ backgroundImage: `url("${images.middle}")` }} />}
      {images?.foreground && <div className="scene-image image-foreground" style={{ backgroundImage: `url("${images.foreground}")` }} />}
      {!images?.background && <div className="library-shelves" aria-hidden="true"><span /><span /><span /><span /></div>}
      {!images?.background && <><div className="fire-glow" aria-hidden="true" /><Candle className="candle-left" /><Candle className="candle-right" /></>}
      <MagicCanvas reduced={reduced} lights={lights} className="atmosphere-canvas" />
      <div className="film-grade" aria-hidden="true" />
      {children}
    </div>
  );
}

function AcademyCrest({ compact = false, motto = 'Lux in Arcanis' }: { compact?: boolean; motto?: string }) {
  const instanceId = useId().replace(/:/g, '');
  const metalId = `${instanceId}-crest-metal`;
  const enamelId = `${instanceId}-crest-enamel`;
  const reliefId = `${instanceId}-crest-relief`;
  return (
    <svg className={`academy-crest ${compact ? 'crest-compact' : ''}`} viewBox="0 0 120 150" role="img" aria-label="Brasão original da Academia de Magia de Valdoria">
      <defs>
        <linearGradient id={metalId} x1="0" x2="1" y1="0" y2="1"><stop stopColor="#fff0b0" /><stop offset=".35" stopColor="#b47b34" /><stop offset=".58" stopColor="#f4d184" /><stop offset="1" stopColor="#765027" /></linearGradient>
        <linearGradient id={enamelId} x1="0" x2="1" y1="0" y2="1"><stop stopColor="#183a38" /><stop offset=".52" stopColor="#28443d" /><stop offset="1" stopColor="#111f25" /></linearGradient>
        <filter id={reliefId} x="-30%" y="-20%" width="160%" height="150%"><feGaussianBlur in="SourceAlpha" stdDeviation="1.5" result="blur" /><feSpecularLighting in="blur" surfaceScale="4" specularConstant=".75" specularExponent="18" lightingColor="#fff1ba" result="shine"><fePointLight x="-40" y="-35" z="70" /></feSpecularLighting><feComposite in="shine" in2="SourceAlpha" operator="in" result="spec" /><feMerge><feMergeNode in="SourceGraphic" /><feMergeNode in="spec" /></feMerge></filter>
      </defs>
      <path d="M10 10h100v76c0 25-18 44-50 58C28 130 10 111 10 86Z" fill={`url(#${enamelId})`} stroke={`url(#${metalId})`} strokeWidth="5" filter={`url(#${reliefId})`} />
      <path d="M17 17h86v68c0 21-16 37-43 50C33 122 17 106 17 85Z" fill="none" stroke={`url(#${metalId})`} strokeOpacity=".7" strokeWidth="1.5" />
      <path d="M60 18v103M18 69h84" stroke="#d7ae64" strokeOpacity=".58" strokeWidth="1.3" />
      <path d="M33 53a14 14 0 1 1 16-22 12 12 0 1 0-16 22Z" fill="#f2d590" stroke="#8a602b" strokeWidth="1.5" />
      <path d="M78 32v22m-5-17h11m-11 0-4 5m15-5 4 5m-10 12-4 8m5-8 5 8" fill="none" stroke="#f2d590" strokeWidth="2.6" strokeLinecap="round" />
      <path d="m84 75 3.8 7.8 8.6 1.2-6.2 6 1.5 8.5-7.7-4.1-7.7 4.1 1.5-8.5-6.2-6 8.6-1.2Z" fill="#f2d590" stroke="#8a602b" strokeWidth="1.3" />
      <path d="M28 98q16-10 32 0v15q-16-10-32 0Zm32 0q16-10 32 0v15q-16-10-32 0Z" fill="#e2c481" stroke="#724f2b" strokeWidth="1.5" />
      <path d="m60 98 0 16" stroke="#72502c" strokeWidth="1.3" />
      <text x="60" y="139" textAnchor="middle" fill="#f3d996" fontSize="7" fontFamily="Georgia,serif" fontStyle="italic">{motto}</text>
    </svg>
  );
}

function CastleScene() {
  return (
    <div className="castle-world" aria-hidden="true">
      <div className="castle-sky"><div className="star-field" /><div className="moon-halo"><div className="moon-disc" /></div><div className="storm-cloud cloud-a" /><div className="storm-cloud cloud-b" /><div className="sky-flash" /></div>
      <div className="castle-mountains mountain-far" /><div className="castle-mountains mountain-near" />
      <svg className="valdoria-castle" viewBox="0 0 500 520" preserveAspectRatio="xMidYMax meet">
        <defs>
          <linearGradient id="stone-face" x1="0" x2="1" y1="0" y2="1"><stop stopColor="#48565a" /><stop offset=".48" stopColor="#2b393d" /><stop offset="1" stopColor="#172328" /></linearGradient>
          <linearGradient id="tower-stone" x1="0" x2="1"><stop stopColor="#667075" /><stop offset=".18" stopColor="#49565a" /><stop offset=".58" stopColor="#303d42" /><stop offset="1" stopColor="#1d292f" /></linearGradient>
          <linearGradient id="window-glow" x1="0" x2="0" y1="0" y2="1"><stop stopColor="#fff0ae" /><stop offset="1" stopColor="#ba713c" /></linearGradient>
          <filter id="castle-soft-light"><feGaussianBlur stdDeviation="12" /></filter>
        </defs>
        <ellipse cx="250" cy="468" rx="240" ry="38" fill="#111a20" />
        <path d="M18 470 62 412h46l22-59 35 18 31-96h36l21-60 39 61h27l29-48 38 29 27-43 50 80 37 58-19 118Z" fill="#24323a" />
        <path d="M46 472V291l44-37 45 37v181Zm54-152V209l40-46 43 46v263Zm63 0V175l55-61 55 61v297Zm81 0V219l43-42 43 42v253Zm76 0V280l38-43 41 43v192Zm66 0V326l29-31 31 31v146Z" fill="url(#tower-stone)" stroke="#879093" strokeOpacity=".34" strokeWidth="3" />
        <g fill="none" stroke="#adb0a5" strokeOpacity=".15" strokeWidth="2">
          <path d="M48 326h85m-84 34h84m-83 32h82m-80 32h79M101 260h82m-81 38h81m-80 37h80m-78 37h78m-76 37h76M164 224h106m-105 39h105m-105 39h105m-103 39h103m-101 39h101m-99 39h99M245 260h86m-84 39h84m-83 39h83m-81 38h81m-79 38h79m-77-135h72m-69 39h68m-66 38h65m-62 38h61" />
          <path d="m88 337 8 8-7 14m36-65-8 9 6 11m53 22-8 8 6 16m54-62 9 10-7 13m67 47-8 9 7 11" />
        </g>
        <path d="m77 255 13-65 14 65m35-51 26-86 26 86m22-27 35-107 36 107m20 21 24-79 24 79m18 52 21-70 22 70m37 67 18-51 18 51" fill="#202c33" stroke="#53616a" strokeWidth="4" />
        <path d="M202 116h51m-44 27h39m-94 44h43m-77 76h43m88-46h43m-16-70h37m33 106h37M46 348h44m202 16h47m64 35h42" stroke="#6b7478" strokeOpacity=".42" strokeWidth="3" />
        <g className="castle-windows" fill="url(#window-glow)">
          <path d="M83 325a9 9 0 0 1 18 0v25H83Z" /><path d="M128 218a10 10 0 0 1 20 0v29h-20Z" />
          <path d="M181 198a12 12 0 0 1 24 0v34h-24Z" /><path d="M234 150a12 12 0 0 1 24 0v39h-24Z" />
          <path d="M299 219a11 11 0 0 1 22 0v32h-22Z" /><path d="M365 267a10 10 0 0 1 20 0v29h-20Z" />
          <path d="M430 341a9 9 0 0 1 18 0v25h-18Z" /><path d="M251 358a11 11 0 0 1 22 0v31h-22Z" />
          <path d="M190 364a9 9 0 0 1 18 0v27h-18Z" /><path d="M306 314a10 10 0 0 1 20 0v29h-20Z" />
        </g>
        <path d="M225 355h53v117h-53Zm18-21h17l-8-23Z" fill="#111c23" stroke="#69757a" strokeOpacity=".38" strokeWidth="2" />
        <path d="M4 476h492v44H4z" fill="#111a20" />
      </svg>
      <div className="castle-lake"><div className="castle-reflection" /></div>
      <div className="castle-mist mist-low" /><div className="castle-mist mist-high" />
      <div className="castle-tree tree-left" /><div className="castle-tree tree-right" />
    </div>
  );
}

function SceneContent({ scene, config, onNext, onReveal, reduced }: {
  scene: OpeningScene;
  config: InviteConfig;
  onNext: () => void;
  onReveal: (amount: number) => void;
  reduced: boolean;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const envelopeTimer = useRef<number | null>(null);
  const [envelopeOpening, setEnvelopeOpening] = useState(false);
  useEffect(() => {
    const root = rootRef.current;
    const target = root?.querySelector('.scene-art');
    if (!target) return;
    if (reduced) {
      gsap.set(target, { y: 0, opacity: 1, scale: 1, filter: 'blur(0px)' });
      return;
    }
    const timeline = gsap.timeline();
    timeline.fromTo(target, { y: 18, opacity: 0.35, scale: 0.97, filter: 'blur(3px)' }, { y: 0, opacity: 1, scale: 1, filter: 'blur(0px)', duration: 1.05, ease: 'power3.out' });
    return () => { timeline.kill(); };
  }, [scene, reduced]);

  useEffect(() => () => {
    if (envelopeTimer.current !== null) window.clearTimeout(envelopeTimer.current);
  }, []);

  const advanceScene = () => {
    if (scene !== 'envelope') {
      onNext();
      return;
    }
    if (envelopeTimer.current !== null) return;
    setEnvelopeOpening(true);
    envelopeTimer.current = window.setTimeout(() => {
      envelopeTimer.current = null;
      onNext();
    }, 560);
  };

  const images = imageLayers(config.backgrounds[scene]);
  return (
    <Library images={images} reduced={reduced} scene={scene} lights={config.lightSources[scene]}>
      <div ref={rootRef} className={`scene scene-${scene}`}>
        {scene !== 'reveal' && <button className="scene-tap-area" onClick={advanceScene} aria-label={sceneHints[scene]} />}
        {scene === 'castle' && (
          <div className="scene-art castle-art">
            {!images.background && <CastleScene />}
            <div className="academy-title"><AcademyCrest motto={config.crestMotto} /><p>✦ &nbsp; {config.academyName.toLocaleUpperCase('pt-BR')} &nbsp; ✦</p><span>Uma história encantada começa aqui</span></div>
          </div>
        )}
        {scene === 'book' && (
          <div className="scene-art book-art">
            {!images.background && <div className="library-depth" aria-hidden="true"><div className="distant-arch" /><div className="bookcase-blur" /><div className="desk-surface" /></div>}
            <div className="flying-letter letter-one">✉</div><div className="flying-letter letter-two">✉</div>
            {config.assets.book
              ? <img className="book-photo" src={config.assets.book} alt="Livro verde de capa ornamentada sobre a mesa da biblioteca" />
              : <div className="book"><div className="book-pages" /><div className="book-cover"><AcademyCrest compact motto={config.crestMotto} /><strong>{config.name}</strong><small>{config.academyName}</small><span className="book-star">✦</span></div></div>}
            <div className="book-copy"><p className="eyebrow">UMA CARTA DA ACADEMIA</p><p className="scene-prompt">Toque para abrir o livro</p></div>
          </div>
        )}
        {scene === 'envelope' && (
          <div className="scene-art envelope-art">
            {config.assets.envelope
              ? <div className={`envelope-photo-stage ${envelopeOpening ? 'is-opening' : ''}`}>
                <img src={config.assets.envelope} alt="Envelope de pergaminho fechado com selo de cera verde" />
                <span className="envelope-flap-photo" aria-hidden="true" />
                <span className="envelope-crest" aria-hidden="true"><AcademyCrest compact motto={config.crestMotto} /></span>
                <span className="envelope-initials">{config.initials}</span>
              </div>
              : <div className="envelope"><div className="envelope-paper"><AcademyCrest compact motto={config.crestMotto} /><span>Uma noite mágica<br />espera por você...</span></div><div className="envelope-flap" /><div className="wax-seal"><AcademyCrest compact motto={config.crestMotto} /><span>{config.initials}</span></div></div>}
            <p className="scene-prompt">Uma carta chegou para você</p>
          </div>
        )}
        {scene === 'map' && (
          <div className="scene-art map-art parchment-copy">
            <span className="parchment-crest" aria-hidden="true"><AcademyCrest compact motto={config.crestMotto} /></span>
            <div className="map-date">Dia {formatDate(new Date(config.dateTime))}</div>
            <p className="map-caption">O destino é uma festa encantada!</p>
          </div>
        )}
        {scene === 'reveal' && (
          <div className="scene-art reveal-art">
            <div className="wand-prompt"><span>✦</span><h2>Um último<br />encantamento...</h2><p>Use a varinha para revelar a surpresa</p></div>
            <div className="reveal-card"><Invitation config={config} compact /></div>
            <MagicCanvas reduced={reduced} className="scratch-canvas" onReveal={onReveal} />
            {config.assets.wand
              ? <img className="wand-photo" src={config.assets.wand} alt="" aria-hidden="true" />
              : <div className="wand" aria-hidden="true">✦</div>}
          </div>
        )}
        <div className="scene-bottom" aria-live="polite">
          <motion.span key={scene} initial={{ opacity: 0 }} animate={{ opacity: 0.85 }} transition={{ delay: 2.4 }}>{sceneHints[scene]}</motion.span>
        </div>
      </div>
    </Library>
  );
}

function Invitation({ config, compact = false }: { config: InviteConfig; compact?: boolean }) {
  return (
    <article className={`invitation-paper ${compact ? 'invitation-compact' : ''}`}>
      <span className="paper-ornament ornament-top">✧ ❧ ✧</span>
      <AcademyCrest compact motto={config.crestMotto} />
      <p className="eyebrow">VOCÊ ESTÁ CONVIDADO(A)</p>
      <h1 className="invite-name">{config.name}</h1>
      <p className="invite-age">{config.age} aninhos <span>✦</span></p>
      <p className="invite-phrase">{config.phrase}</p>
      <div className="date-block"><span>{new Intl.DateTimeFormat('pt-BR', { weekday: 'long', timeZone: 'America/Fortaleza' }).format(new Date(config.dateTime))}</span><strong>{new Intl.DateTimeFormat('pt-BR', { day: '2-digit', timeZone: 'America/Fortaleza' }).format(new Date(config.dateTime))}</strong><span>{new Intl.DateTimeFormat('pt-BR', { month: 'long', timeZone: 'America/Fortaleza' }).format(new Date(config.dateTime))}</span><i>às {new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Fortaleza' }).format(new Date(config.dateTime))}</i></div>
      <p className="invite-venue">{config.venue}</p>
      <span className="paper-ornament ornament-bottom">❧ ✦ ❧</span>
    </article>
  );
}

function useCountdown(dateTime: string) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(interval);
  }, []);
  return useMemo(() => {
    const eventDate = new Date(dateTime);
    const delta = eventDate.getTime() - now;
    const dayInFortaleza = (date: Date) => new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Fortaleza', year: 'numeric', month: '2-digit', day: '2-digit',
    }).format(date);
    if (delta <= 0 && dayInFortaleza(eventDate) === dayInFortaleza(new Date(now))) return 'É hoje! ✨';
    if (delta <= 0) return 'A festa já começou! ✨';
    const days = Math.floor(delta / 86_400_000);
    const hours = Math.floor((delta % 86_400_000) / 3_600_000);
    const minutes = Math.floor((delta % 3_600_000) / 60_000);
    return `${days} dias · ${hours}h · ${minutes}min`;
  }, [dateTime, now]);
}

function Medal({ icon, label, onClick }: { icon: string; label: string; onClick: () => void }) {
  return <button className="medal-button" onClick={onClick}><span className="medal"><Icon name={icon} /></span><span>{label}</span></button>;
}

function InvitationPage({ config, openSheet, onSkip, reduced }: { config: InviteConfig; openSheet: (sheet: SheetId) => void; onSkip: boolean; reduced: boolean }) {
  const countdown = useCountdown(config.dateTime);
  const medals = [
    ['rsvp', 'rsvp', 'Confirmar presença'],
    ['location', 'map', 'Local da festa'],
    ['dress', 'dress', 'Traje'],
    ['gifts', 'gifts', 'Presentes'],
    ['hat', 'hat', 'Chapéu Mágico'],
  ] as const;
  return (
    <Library images={imageLayers(config.backgrounds.invitation)} reduced={reduced} scene="invitation" lights={config.lightSources.invitation}>
      <motion.main className="final-scene" initial={onSkip ? { opacity: 0 } : false} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}>
        <div className="final-heading"><span>✦</span> UMA CARTA PARA VOCÊ <span>✦</span></div>
        <Invitation config={config} />
        <div className="countdown"><span>CONTAGEM ENCANTADA</span><strong>{countdown}</strong></div>
        <nav className="medal-row" aria-label="Informações do convite">
          {medals.filter(([id]) => config.medals[id]).map(([id, icon, label]) => <Medal key={id} icon={icon} label={label} onClick={() => openSheet(id)} />)}
        </nav>
        <p className="footer-note">Feito com carinho e um pouquinho de magia ✨</p>
      </motion.main>
    </Library>
  );
}

function Sheet({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [onClose]);
  return (
    <motion.div className="sheet-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.section className="bottom-sheet" role="dialog" aria-modal="true" aria-label={title} initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 28, stiffness: 280 }} onClick={(event) => event.stopPropagation()}>
        <div className="sheet-handle" /><button className="sheet-close" onClick={onClose} aria-label="Fechar"><Icon name="close" /></button>
        <h2>{title}</h2><div className="sheet-content">{children}</div>
      </motion.section>
    </motion.div>
  );
}

function HatCharacter({ thinking, speaking, image }: { thinking: boolean; speaking: boolean; image?: string }) {
  if (image) {
    return <img className={`hat-character hat-photo ${thinking ? 'hat-thinking' : ''}`} src={image} alt="Chapéu de couro mágico com luz verde" />;
  }
  return (
    <svg className={`hat-character ${thinking ? 'hat-thinking' : ''}`} viewBox="0 0 220 220" role="img" aria-label="Chapéu mágico roxo sorridente">
      <ellipse cx="110" cy="187" rx="78" ry="15" fill="#10091e" opacity=".22" />
      <path d="M41 166 Q58 116 84 54 Q98 27 117 50 Q146 89 161 164Z" fill="#542386" stroke="#d4a24c" strokeWidth="3" />
      <path d="M79 75 110 67l7 7-19 8Zm50 36 18 2-3 8-20-4Zm-49 37 15-10 5 8-17 12Z" fill="#f5d48a" />
      <path d="M29 166 Q110 143 190 166 Q202 177 190 185 Q107 203 28 185 Q17 176 29 166Z" fill="#40205e" stroke="#d4a24c" strokeWidth="3" />
      <path d="M33 170 Q110 151 186 170" fill="none" stroke="#f5d48a" strokeWidth="7" />
      <path d="M113 49q14-5 12-18 17 10 5 27" fill="none" stroke="#f5d48a" strokeWidth="4" />
      <g className="hat-eyes"><circle cx="91" cy="129" r="15" fill="#fff5da" /><circle cx="135" cy="127" r="15" fill="#fff5da" />
        <circle cx="94" cy="132" r="7" fill="#251538" /><circle cx="132" cy="130" r="7" fill="#251538" />
        <circle cx="96" cy="129" r="2.5" fill="#fff" /><circle cx="134" cy="127" r="2.5" fill="#fff" /></g>
      <path className={speaking ? 'hat-mouth speaking' : 'hat-mouth'} d="M104 149q9 9 18 0" fill="none" stroke="#32163e" strokeWidth="3" strokeLinecap="round" />
      <path d="m162 78 3-9 3 9 9 3-9 3-3 9-3-9-9-3Z" fill="#f5d48a" />
    </svg>
  );
}

function App() {
  const config = convite;
  const [scene, setScene] = useState<SceneId>(() => sceneOrder.find((id) => convite.scenes[id]) ?? 'invitation');
  const [sheet, setSheet] = useState<SheetId>(null);
  const [soundOn, setSoundOn] = useState(Boolean(config.music));
  const [slowDevice, setSlowDevice] = useState(false);
  const [visitorName, setVisitorName] = useState('');
  const [title, setTitle] = useState<MagicalTitle | null>(null);
  const [hatThinking, setHatThinking] = useState(false);
  const [hatMessage, setHatMessage] = useState('Olá, viajante! Como você se chama?');
  const [displayedHatMessage, setDisplayedHatMessage] = useState('');
  const [rsvpName, setRsvpName] = useState('');
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [message, setMessage] = useState('');
  const [toast, setToast] = useState('');
  const audioRef = useRef<HTMLAudioElement>(null);
  const phoneRef = useRef<HTMLDivElement>(null);
  const orientationReady = useRef(false);
  const [orientationTick, setOrientationTick] = useState(0);
  const reduced = Boolean(useReducedMotion());
  const finalRef = useRef(false);
  const [pageHidden, setPageHidden] = useState(false);

  useEffect(() => {
    const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
    let start = 0;
    let frames = 0;
    let frameId = 0;
    const measure = (time: number) => {
      if (!start) start = time;
      frames += 1;
      if (time - start >= 2000) {
        if (frames / ((time - start) / 1000) < 45) setSlowDevice(true);
        return;
      }
      frameId = window.requestAnimationFrame(measure);
    };
    if ((navigator.hardwareConcurrency ?? 8) <= 4 || (memory !== undefined && memory <= 4)) setSlowDevice(true);
    frameId = window.requestAnimationFrame(measure);
    return () => window.cancelAnimationFrame(frameId);
  }, []);

  useEffect(() => {
    const sceneIndex = sceneOrder.indexOf(scene as OpeningScene);
    const upcomingScenes = sceneIndex < 0
      ? ['invitation' as const]
      : [sceneOrder[sceneIndex], ...sceneOrder.slice(sceneIndex + 1).filter((candidate) => config.scenes[candidate]).slice(0, 1)];
    const sceneAssets: Partial<Record<SceneId, string>> = {
      castle: config.assets.castle,
      book: config.assets.book,
      envelope: config.assets.envelope,
      map: config.assets.parchment,
      reveal: config.assets.wand,
      invitation: config.assets.hat,
    };
    const timer = window.setTimeout(() => {
      upcomingScenes.forEach((sceneId) => {
        const layers = imageLayers(config.backgrounds[sceneId]);
        [...Object.values(layers), sceneAssets[sceneId]].forEach((source) => {
          if (!source) return;
          const image = new Image();
          image.decoding = 'async';
          image.src = source;
        });
      });
    }, 350);
    return () => window.clearTimeout(timer);
  }, [config.assets, config.backgrounds, config.scenes, scene]);

  useEffect(() => {
    const visibility = () => setPageHidden(document.hidden);
    document.addEventListener('visibilitychange', visibility);
    return () => document.removeEventListener('visibilitychange', visibility);
  }, []);

  useEffect(() => {
    if (sheet === 'rsvp') setRsvpName(visitorName || '');
  }, [sheet, visitorName]);

  useEffect(() => {
    setDisplayedHatMessage('');
    let position = 0;
    const timer = window.setInterval(() => {
      position += 1;
      setDisplayedHatMessage(hatMessage.slice(0, position));
      if (position >= hatMessage.length) window.clearInterval(timer);
    }, 24);
    return () => window.clearInterval(timer);
  }, [hatMessage]);

  const requestParallax = useCallback(() => {
    if (orientationReady.current || !('DeviceOrientationEvent' in window)) return;
    const orientation = DeviceOrientationEvent as typeof DeviceOrientationEvent & {
      requestPermission?: () => Promise<'granted' | 'denied'>;
    };
    if (typeof orientation.requestPermission === 'function') {
      void orientation.requestPermission().then((permission) => {
        orientationReady.current = permission === 'granted';
        if (permission === 'granted') setOrientationTick((tick) => tick + 1);
      }).catch(() => {
        orientationReady.current = false;
      });
    } else {
      orientationReady.current = true;
      setOrientationTick((tick) => tick + 1);
    }
  }, []);

  useEffect(() => {
    if (!orientationReady.current) return;
    const tilt = (event: DeviceOrientationEvent) => {
      const x = Math.max(-1, Math.min(1, (event.gamma ?? 0) / 30));
      const y = Math.max(-1, Math.min(1, (event.beta ?? 0) / 45));
      phoneRef.current?.style.setProperty('--tilt-x', `${x * 9}px`);
      phoneRef.current?.style.setProperty('--tilt-y', `${y * 9}px`);
    };
    window.addEventListener('deviceorientation', tilt, { passive: true });
    return () => window.removeEventListener('deviceorientation', tilt);
  }, [orientationTick]);

  const playMusic = useCallback(() => {
    if (!config.music || !audioRef.current || !soundOn) return;
    void audioRef.current.play().catch(() => setSoundOn(false));
  }, [config.music, soundOn]);

  const toggleMusic = () => {
    if (!config.music || !audioRef.current) {
      showToast('Adicione uma música em src/config/convite.ts para ativar o som.');
      return;
    }
    if (soundOn) {
      audioRef.current.pause();
      setSoundOn(false);
    } else {
      setSoundOn(true);
      void audioRef.current.play().catch(() => {
        setSoundOn(false);
        showToast('Não foi possível iniciar a música neste navegador.');
      });
    }
  };

  const goNext = useCallback(() => {
    requestParallax();
    playMusic();
    vibrate();
    const currentIndex = sceneOrder.indexOf(scene as OpeningScene);
    const next = sceneOrder.slice(currentIndex + 1).find((candidate) => config.scenes[candidate]);
    if (next) setScene(next);
    else setScene('invitation');
  }, [config.scenes, playMusic, requestParallax, scene]);

  const reveal = useCallback((amount: number) => {
    if (amount > 0.55 && !finalRef.current) {
      finalRef.current = true;
      vibrate([30, 45, 70]);
      setScene('reveal');
      confetti({ particleCount: 65, spread: 75, origin: { y: 0.64 }, colors: [config.palette.gold, config.palette.paleGold, config.palette.purple] });
      window.setTimeout(() => setScene('invitation'), 850);
    }
  }, [config.palette]);

  const openInvitation = useCallback(() => {
    requestParallax();
    playMusic();
    finalRef.current = true;
    setScene('invitation');
  }, [playMusic, requestParallax]);

  const showToast = (text: string) => {
    setToast(text);
    window.setTimeout(() => setToast(''), 2600);
  };

  const copyPix = async () => {
    if (!config.pixKey) {
      showToast('A chave Pix será informada em breve ✨');
      return;
    }
    try {
      await navigator.clipboard.writeText(config.pixKey);
    } catch {
      const input = document.createElement('textarea');
      input.value = config.pixKey;
      input.style.position = 'fixed';
      input.style.opacity = '0';
      document.body.append(input);
      input.select();
      const copied = document.execCommand('copy');
      input.remove();
      if (!copied) {
        showToast('Não foi possível copiar. Selecione a chave para copiar.');
        return;
      }
    }
    showToast('Chave Pix copiada! ✨');
    vibrate();
  };

  const makeTitle = () => {
    const trimmed = visitorName.trim();
    if (!trimmed) return;
    setHatThinking(true);
    setHatMessage('Hmm... sinto muita magia e uma vontade enorme de comer bolo!');
    window.setTimeout(() => {
      const picked = deterministicTitle(trimmed, config.magicalTitles);
      setTitle(picked);
      setHatThinking(false);
      setHatMessage(`Eu sabia! ${trimmed}, seu título mágico é...`);
      vibrate([25, 30, 55]);
      confetti({ particleCount: 48, spread: 62, origin: { y: 0.55 }, colors: [picked.color, config.palette.gold, '#ffffff'] });
    }, 1350);
  };

  const sendRsvp = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = rsvpName.trim();
    if (!name) return;
    const date = new Date(config.dateTime);
    const text = [
      `Olá! Confirmo presença no aniversário de ${config.name} 🎂`,
      `Nome: ${name}`,
      `Adultos: ${adults} | Crianças: ${children}`,
      title ? `Meu título mágico: ${title.title}` : '',
      message.trim() ? `Recadinho: ${message.trim()}` : '',
      `Até ${formatDate(date)}! ✨`,
    ].filter(Boolean).join('\n');
    vibrate([30, 40, 60]);
    confetti({ particleCount: 70, spread: 80, origin: { y: 0.68 }, colors: [config.palette.gold, config.palette.purple, config.palette.lilac] });
    const whatsapp = config.whatsapp.replace(/\D/g, '');
    if (!/^\d{10,15}$/.test(whatsapp)) {
      showToast('Adicione o WhatsApp dos pais em src/config/convite.ts para confirmar.');
      return;
    }
    window.location.href = `https://wa.me/${whatsapp}?text=${encodeURIComponent(text)}`;
  };

  const addToCalendar = () => {
    const blob = new Blob([makeCalendarFile(config)], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `aniversario-${config.name.toLocaleLowerCase('pt-BR').replace(/\s+/g, '-')}.ics`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const activeScene: OpeningScene | null = scene === 'invitation' ? null : scene;
  const currentSheetTitle = sheet ? ({
    rsvp: 'Confirmar presença', location: 'Local da festa', dress: 'Traje mágico', gifts: 'Sugestões de presente', hat: 'Chapéu Mágico',
  } satisfies Record<MedalId, string>)[sheet] : '';

  return (
    <div className={`app-shell ${pageHidden ? 'page-hidden' : ''} ${reduced || slowDevice ? 'reduced-effects' : ''}`} style={{
      '--deep': config.palette.deep, '--night': config.palette.night, '--purple': config.palette.purple,
      '--lilac': config.palette.lilac, '--gold': config.palette.gold, '--pale-gold': config.palette.paleGold,
      '--parchment': config.palette.parchment, '--paper': config.palette.paper, '--enamel': config.palette.enamel,
    } as React.CSSProperties}>
      <svg className="film-filters" aria-hidden="true">
        <defs>
          <filter id="wax-relief" x="-25%" y="-25%" width="150%" height="150%">
            <feTurbulence type="fractalNoise" baseFrequency=".055" numOctaves="2" seed="12" result="waxNoise" />
            <feDisplacementMap in="SourceGraphic" in2="waxNoise" scale="2" xChannelSelector="R" yChannelSelector="G" result="waxShape" />
            <feSpecularLighting in="waxNoise" surfaceScale="3" specularConstant=".55" specularExponent="14" lightingColor="#f2bc8b" result="waxShine"><fePointLight x="-25" y="-35" z="55" /></feSpecularLighting>
            <feComposite in="waxShine" in2="SourceAlpha" operator="in" result="waxHighlight" />
            <feMerge><feMergeNode in="waxShape" /><feMergeNode in="waxHighlight" /></feMerge>
          </filter>
          <filter id="paper-relief" x="-8%" y="-8%" width="116%" height="116%">
            <feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="2" seed="6" result="paperFiber" />
            <feDisplacementMap in="SourceGraphic" in2="paperFiber" scale="1.4" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>
      <div className="phone-frame" ref={phoneRef}>
        <button className="sound-button" onClick={toggleMusic} aria-label={soundOn ? 'Desligar música' : 'Ligar música'} aria-pressed={soundOn}><Icon name="music" /><span>{soundOn ? '♫' : ''}</span></button>
        {config.music && <audio ref={audioRef} src={config.music} loop preload="none" />}
        <AnimatePresence mode="wait">
          {activeScene ? (
            <motion.div
              className="screen"
              key={activeScene}
              initial={{ opacity: 0, scale: activeScene === 'castle' ? 1 : 1.035, filter: reduced || slowDevice ? 'blur(0px)' : 'blur(4px)' }}
              animate={{ opacity: 1, scale: 1, x: 0, filter: 'blur(0px)' }}
              exit={activeScene === 'castle'
                ? { opacity: 0, scale: 1.18, filter: reduced || slowDevice ? 'blur(0px)' : 'blur(9px)' }
                : { opacity: 0, x: -18, filter: reduced || slowDevice ? 'blur(0px)' : 'blur(3px)' }}
              transition={{ duration: reduced ? 0.15 : 1.1, ease: [0.22, 0.61, 0.36, 1] }}
            >
              <SceneContent scene={activeScene} config={config} onNext={goNext} onReveal={reveal} reduced={reduced || slowDevice} />
              <button className="skip-button" onClick={openInvitation}>Pular <span>↗</span></button>
            </motion.div>
          ) : <InvitationPage config={config} openSheet={setSheet} onSkip={true} reduced={reduced || slowDevice} />}
        </AnimatePresence>
      </div>
      <AnimatePresence>
        {sheet && <Sheet title={currentSheetTitle} onClose={() => setSheet(null)}>
          {sheet === 'rsvp' && (
            <form className="rsvp-form" onSubmit={sendRsvp}>
              <p>Vai ser uma alegria ter você nessa aventura! ✨</p>
              <label>Seu nome<input autoComplete="name" required minLength={2} value={rsvpName} onChange={(event) => setRsvpName(event.target.value)} placeholder="Como podemos te chamar?" /></label>
              <div className="counter-row">
                <label>Adultos<span className="stepper"><button type="button" onClick={() => setAdults(Math.max(0, adults - 1))} aria-label="Diminuir adultos">−</button><b>{adults}</b><button type="button" onClick={() => setAdults(Math.min(20, adults + 1))} aria-label="Adicionar adulto">+</button></span></label>
                <label>Crianças<span className="stepper"><button type="button" onClick={() => setChildren(Math.max(0, children - 1))} aria-label="Diminuir crianças">−</button><b>{children}</b><button type="button" onClick={() => setChildren(Math.min(20, children + 1))} aria-label="Adicionar criança">+</button></span></label>
              </div>
              <label>Um recadinho para {config.name}<textarea value={message} onChange={(event) => setMessage(event.target.value)} maxLength={240} placeholder="Escreva algo carinhoso (opcional)" /></label>
              {title && <div className="title-chip">✦ {title.title}</div>}
              <button className="primary-button" type="submit">Confirmar pelo WhatsApp <span>✦</span></button>
              {!config.whatsapp && <small className="config-note">O WhatsApp será ativado quando o número dos pais for configurado.</small>}
              {config.rsvpDeadline && <small className="deadline">Confirme até {formatDate(new Date(config.rsvpDeadline))}</small>}
            </form>
          )}
          {sheet === 'location' && <div className="info-panel"><div className="info-illustration"><Icon name="map" /></div><h3>{config.venue}</h3><p>{config.address}</p><a className="primary-button" href={config.mapUrl} target="_blank" rel="noreferrer">Abrir no Google Maps <span>↗</span></a><button className="secondary-button" onClick={addToCalendar}>Adicionar à agenda <span>＋</span></button><a className="text-link" href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`${config.age} anos de ${config.name}`)}&dates=${new Date(config.dateTime).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}/${new Date(new Date(config.dateTime).getTime() + 3 * 3600000).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}&details=${encodeURIComponent(config.phrase)}&location=${encodeURIComponent(`${config.venue}, ${config.address}`)}`} target="_blank" rel="noreferrer">Adicionar ao Google Agenda ↗</a></div>}
          {sheet === 'dress' && <div className="info-panel"><div className="info-illustration"><Icon name="dress" /></div><p className="dress-message">{config.dressCode}</p><span className="sparkle-line">✧ ─── ✦ ─── ✧</span></div>}
          {sheet === 'gifts' && <div className="gift-panel"><p>O melhor presente é a sua presença! Se quiser, estas ideias podem ajudar:</p><div className="gift-grid">{config.gifts.map((gift) => <div className="gift-card" key={gift.item}><Icon name={gift.icon} /><strong>{gift.item}</strong>{gift.size && <span>{gift.size}</span>}</div>)}</div><div className="pix-card"><div><span>✦ CONTRIBUIÇÃO ENCANTADA</span><strong>{config.pixHolder || 'Chave Pix'}</strong><small>{config.pixKey || 'Chave disponível em breve'}</small></div><button onClick={copyPix} aria-label="Copiar chave Pix"><Icon name="copy" /></button></div></div>}
          {sheet === 'hat' && <div className="hat-panel"><div className="hat-stage"><span className="hat-runes" aria-hidden="true">✦ ⟡ ☾ ⟡ ✦</span><HatCharacter thinking={hatThinking} speaking={displayedHatMessage.length < hatMessage.length} image={config.assets.hat} /></div><div className={`speech-bubble ${hatThinking ? 'typing' : ''}`}>{displayedHatMessage}</div><label className="hat-name">Seu nome<input value={visitorName} onChange={(event) => { setVisitorName(event.target.value); setTitle(null); }} onKeyDown={(event) => { if (event.key === 'Enter') makeTitle(); }} maxLength={40} placeholder="Digite seu nome" /></label><button className="primary-button" onClick={makeTitle} disabled={hatThinking || !visitorName.trim()}>{title ? 'Sortear meu título' : 'Descobrir meu título'} <span>✦</span></button>{title && <motion.div className="hat-result" initial={{ opacity: 0, scale: 0.7, rotate: -8 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} style={{ '--title-color': title.color } as React.CSSProperties}><span className="result-star">✦</span><Icon name={title.icon} /><strong>{title.title}</strong><button onClick={() => { setSheet('rsvp'); setRsvpName(visitorName); }}>Confirmar presença com meu título</button></motion.div>}</div>}
        </Sheet>}
      </AnimatePresence>
      <AnimatePresence>{toast && <motion.div className="toast" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }} role="status">{toast}</motion.div>}</AnimatePresence>
    </div>
  );
}

export default App;
