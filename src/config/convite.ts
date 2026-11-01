export type SceneId = 'castle' | 'book' | 'envelope' | 'map' | 'reveal' | 'invitation';
export type MedalId = 'rsvp' | 'location' | 'dress' | 'gifts' | 'hat';
export interface SceneImageLayers {
  background?: string;
  middle?: string;
  foreground?: string;
}

export interface SceneLight {
  x: number;
  y: number;
  kind: 'candle' | 'fire' | 'window' | 'moon' | 'wand';
}

export type SceneBackground = string | SceneImageLayers;

export interface MagicalTitle {
  title: string;
  icon: 'potion' | 'dragon' | 'bubble' | 'unicorn' | 'star' | 'cake';
  color: string;
}

export interface GiftSuggestion {
  icon: 'shirt' | 'shoe' | 'toy' | 'book';
  item: string;
  size?: string;
}

export interface InviteConfig {
  academyName: string;
  crestMotto: string;
  name: string;
  age: number;
  initials: string;
  phrase: string;
  dateTime: string;
  venue: string;
  address: string;
  mapUrl: string;
  whatsapp: string;
  rsvpDeadline: string;
  dressCode: string;
  gifts: GiftSuggestion[];
  pixKey: string;
  pixHolder: string;
  music: string;
  assets: {
    castle: string;
    book: string;
    envelope: string;
    parchment: string;
    wand: string;
    hat: string;
  };
  backgrounds: Partial<Record<SceneId, SceneBackground>>;
  lightSources: Partial<Record<SceneId | 'hat', SceneLight[]>>;
  palette: {
    deep: string;
    night: string;
    purple: string;
    lilac: string;
    gold: string;
    paleGold: string;
    parchment: string;
    paper: string;
    enamel: string;
  };
  magicalTitles: MagicalTitle[];
  scenes: Record<SceneId, boolean>;
  medals: Record<MedalId, boolean>;
}

export const convite: InviteConfig = {
  academyName: 'Escola de Magia e Bruxaria de Valdoria',
  crestMotto: 'Lux in Arcanis',
  name: 'Anna Liz',
  age: 4,
  initials: 'AL',
  phrase: 'Entre feitiços, poções e muita diversão, a pequena bruxinha Anna Liz convida você para comemorar seu 4º aniversário!',
  dateTime: '2027-05-16T16:00:00-03:00',
  venue: 'Salão Encantado',
  address: 'Rua Treze de Maio, nº 329 – Itaporanga-PB',
  mapUrl: 'https://www.google.com/maps/search/?api=1&query=Rua+Treze+de+Maio+329+Itaporanga+PB',
  whatsapp: '',
  rsvpDeadline: '2027-05-16T23:59:00-03:00',
  dressCode: 'Venha de bruxinho(a)! Capa, chapéu ou varinha são muito bem-vindos.',
  gifts: [
    { icon: 'shirt', item: 'Roupa', size: 'Tamanho 4' },
    { icon: 'shoe', item: 'Calçado', size: 'Número 25' },
    { icon: 'toy', item: 'Brinquedos', size: 'Para 4 anos' },
    { icon: 'book', item: 'Livros', size: 'Histórias mágicas' },
  ],
  pixKey: '',
  pixHolder: '',
  music: '/musica/tema-magico.wav',
  assets: {
    castle: '/cenas/01-castelo/castelo.webp',
    book: '/cenas/02-livro/livro.png',
    envelope: '/cenas/03-carta/envelope.png',
    parchment: '/cenas/04-pergaminho/pergaminho.webp',
    wand: '/cenas/05-varinha/varinha.png',
    hat: '/cenas/07-chapeu/chapeu.png',
  },
  backgrounds: {
    castle: { background: '/cenas/01-castelo/castelo.webp' },
    book: { background: '/cenas/02-livro/fundo.webp' },
    envelope: { background: '/cenas/02-livro/fundo.webp' },
    map: { background: '/cenas/04-pergaminho/pergaminho.webp' },
    invitation: { background: '/cenas/02-livro/fundo.webp' },
  },
  lightSources: {
    castle: [
      { x: 20, y: 22, kind: 'moon' },
      { x: 30, y: 39, kind: 'window' },
      { x: 43, y: 36, kind: 'window' },
      { x: 51, y: 34, kind: 'window' },
      { x: 59, y: 38, kind: 'window' },
      { x: 67, y: 39, kind: 'window' },
      { x: 75, y: 42, kind: 'window' },
    ],
    book: [
      { x: 7, y: 13, kind: 'candle' },
      { x: 18, y: 23, kind: 'candle' },
      { x: 30, y: 39, kind: 'candle' },
      { x: 87, y: 11, kind: 'candle' },
      { x: 80, y: 38, kind: 'candle' },
      { x: 75, y: 54, kind: 'candle' },
      { x: 73, y: 68, kind: 'fire' },
    ],
    envelope: [
      { x: 7, y: 13, kind: 'candle' },
      { x: 18, y: 23, kind: 'candle' },
      { x: 30, y: 39, kind: 'candle' },
      { x: 87, y: 11, kind: 'candle' },
      { x: 80, y: 38, kind: 'candle' },
      { x: 75, y: 54, kind: 'candle' },
      { x: 73, y: 68, kind: 'fire' },
    ],
    map: [
      { x: 6, y: 8, kind: 'candle' },
      { x: 83, y: 7, kind: 'candle' },
      { x: 91, y: 76, kind: 'candle' },
      { x: 15, y: 89, kind: 'fire' },
    ],
    reveal: [{ x: 50, y: 49, kind: 'wand' }],
    invitation: [
      { x: 7, y: 13, kind: 'candle' },
      { x: 18, y: 23, kind: 'candle' },
      { x: 87, y: 11, kind: 'candle' },
      { x: 75, y: 68, kind: 'fire' },
    ],
    hat: [{ x: 50, y: 49, kind: 'wand' }],
  },
  palette: {
    deep: '#10191b',
    night: '#0b1114',
    purple: '#40564f',
    lilac: '#a7b3a1',
    gold: '#b88a4a',
    paleGold: '#ead29a',
    parchment: '#e4d1aa',
    paper: '#c4aa79',
    enamel: '#174737',
  },
  magicalTitles: [
    { title: 'Mestre(a) das Poções de Chocolate', icon: 'potion', color: '#b66bff' },
    { title: 'Guardião(ã) dos Dragõezinhos', icon: 'dragon', color: '#ff9466' },
    { title: 'Feiticeiro(a) das Bolhas de Sabão', icon: 'bubble', color: '#63d8df' },
    { title: 'Domador(a) de Unicórnios', icon: 'unicorn', color: '#ff8ac2' },
    { title: 'Bruxinho(a) das Estrelas Cadentes', icon: 'star', color: '#f5d48a' },
    { title: 'Encantador(a) de Brigadeiros', icon: 'cake', color: '#be82ff' },
  ],
  scenes: { castle: true, book: true, envelope: true, map: true, reveal: true, invitation: true },
  medals: { rsvp: true, location: true, dress: true, gifts: true, hat: true },
};
