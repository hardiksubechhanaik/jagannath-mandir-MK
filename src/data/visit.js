// src/data/visit.js
// ─────────────────────────────────────────────────────────────────────────────
// Visit page data — swap individual arrays for fetch('/api/...') later.
// ─────────────────────────────────────────────────────────────────────────────

export const GLANCE = [
  { label: 'Open daily',  value: '5:00 AM – 9:30 PM',  note: 'Summer · midday rest 1:30–4:00 PM' },
  { label: 'Entry',       value: 'Free for all',     note: 'No ticket required' },
  { label: 'Best time',   value: 'Aarti hours',      note: 'Arrive 20 min early' },
  { label: 'Prasad',      value: 'Annadan daily',    note: 'Mahaprasad served' },
];

export const HOURS = [
  { name: 'Temple Opens',               odia: 'ମନ୍ଦିର ଖୋଲିବ',    time: '5:00 AM' },
  { name: 'Mangla Aarti',               odia: 'ମଙ୍ଗଳ ଆରତୀ',    time: '5:30 AM' },
  { name: 'Bala Dhupa',                 odia: 'ବାଳ ଧୂପ',        time: '9:00 AM' },
  { name: 'Madhyan Prasad Offering',    odia: 'ମଧ୍ୟାହ୍ନ ପ୍ରସାଦ', time: '12:30 PM' },
  { name: 'Pahad (midday rest)',        odia: 'ପାହାଡ଼ (ଶୟନ)',   time: '1:30 PM' },
  { name: 'Temple Reopens',             odia: 'ମନ୍ଦିର ପୁନଃ ଖୋଲିବ', time: '4:00 PM' },
  { name: 'Evening Aarti',              odia: 'ସନ୍ଧ୍ୟା ଆରତୀ',    time: '7:00 PM' },
  { name: 'Pahad (night rest)',         odia: 'ପାହାଡ଼ (ଶୟନ)',   time: '9:30 PM' },
];

export const REACH = [
  {
    id: 'road',
    mode: 'By Road',
    desc: 'On the Gurugram–Sohna road near Maruti Kunj, Bhondsi. Ample parking is available beside the temple grounds.',
  },
  {
    id: 'metro',
    mode: 'By Metro',
    steps: [
      'Take the Yellow Line and alight at HUDA City Centre metro station.',
      'Board the 111B Gurgaon bus to Maruti Kunj — or take an auto/cab toward Bhondsi (~30–40 min).',
      'From Maruti Kunj, walk 5 minutes to Shree Jagannath Mandir.',
    ],
  },
  {
    id: 'rail',
    mode: 'By Rail & Air',
    desc: 'Gurgaon Railway Station and IGI Airport are both within an hour by road, with taxis and ride-shares readily available.',
  },
];

export const DOS = [
  'Dress modestly — traditional or covered attire is appreciated.',
  'Remove footwear at the designated stands before entering.',
  'Maintain silence and queue calmly during aarti.',
  'Accept and partake of mahaprasad with reverence.',
];

export const DONTS = [
  'Photography is not permitted inside the sanctum.',
  'Leather items and tobacco are not allowed inside.',
  'Avoid touching the deities or ritual articles.',
  'Please do not carry large bags into the shrine.',
];

export const FACILITIES = [
  { glyph: '☷', title: 'Footwear Stand',  desc: 'Free, supervised footwear counters at the entrance.' },
  { glyph: '✆', title: 'Help Desk',       desc: 'Volunteers to guide first-time and elderly devotees.' },
  { glyph: '☂', title: 'Shaded Queue',    desc: 'Covered waiting area for darshan during peak hours.' },
  { glyph: '⊞', title: 'Parking',         desc: 'On-site parking for two-wheelers and cars.' },
  { glyph: '✿', title: 'Prasad Counter',  desc: 'Flowers, bhoga and mahaprasad available to devotees.' },
];
