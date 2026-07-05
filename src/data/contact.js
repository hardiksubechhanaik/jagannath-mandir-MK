import {
  DIRECTIONS_URL,
  TEMPLE_ADDRESS,
  TEMPLE_EMAIL,
  TEMPLE_PHONE,
  WHATSAPP_URL,
} from './site.js';

export const CONTACT_INFO = [
  {
    icon: '⊙',
    title: 'Address',
    body: 'Shree Jagannath Mandir,\nMaruti Kunj, Bhondsi,\nGurgaon, Sector 67 122102',
    href: DIRECTIONS_URL,
  },
  {
    icon: '✆',
    title: 'Call / WhatsApp',
    body: `${TEMPLE_PHONE}\nWhatsApp available`,
    href: WHATSAPP_URL,
  },
  {
    icon: '✉',
    title: 'Email',
    body: TEMPLE_EMAIL,
    href: `mailto:${TEMPLE_EMAIL}`,
  },
  { icon: '◷', title: 'Office Hours', body: '9:00 AM – 9:00 PM\nEvery day' },
  {
    icon: '◈',
    title: 'Help Desk',
    body: `${TEMPLE_PHONE}\nMon–Sun · 9 AM–9 PM`,
  },
];

export const NARASIMHA_IMAGE = '/images/deities/parivar/narasimha.png';

export { WHATSAPP_NUMBER } from './site.js';
