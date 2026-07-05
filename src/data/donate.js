// src/data/donate.js
// ─────────────────────────────────────────────────────────────────────────────
// Donate page data — swap for fetch('/api/...') later.
// ─────────────────────────────────────────────────────────────────────────────

export const PURPOSES = [
  {
    odia:  'ମନ୍ଦିର',
    title: 'Temple Upkeep',
    desc:  'Maintaining the shrine, lighting, and the sacred space of the deities.',
  },
  {
    odia:  'ସେବା ପୂଜା',
    title: 'Daily Seva & Puja',
    desc:  'The daily rituals, flowers, incense and offerings for the Lord.',
  },
  {
    odia:  'ଅନ୍ନଦାନ',
    title: 'Annadan',
    desc:  'Mahaprasad and community meals served free to every visiting devotee.',
  },
  {
    odia:  'ସମାଜ',
    title: 'Community Support',
    desc:  'Cultural programs, education and seva for the wider community.',
  },
];

export const AMOUNTS = [
  { amt: '501',    note: 'Lamp & flowers'    },
  { amt: '1,100',  note: 'A day\'s puja'     },
  { amt: '2,100',  note: 'Feeds 50 devotees' },
  { amt: '5,100',  note: 'A day\'s bhoga'    },
  { amt: '11,000', note: 'Festival seva'     },
  { amt: '21,000', note: 'Annadan patron'    },
];

export const TRUST = [
  'Your donation is processed over a secure, encrypted gateway.',
  'Funds are used transparently for temple worship and social seva.',
  'Eligible for 80G tax exemption — receipt issued instantly by email.',
];

export const BANK = [
  { label: 'Account name',   value: 'JAGANNATH MANDIR MARUTI KUNJ', mono: false },
  { label: 'Account Number', value: '114705002234',                 mono: true  },
  { label: 'IFSC Code',      value: 'ICIC0001147',                  mono: true  },
  { label: 'Bank',           value: 'ICICI Bank',                   mono: false },
];
