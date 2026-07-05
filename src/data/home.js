import { getUpcomingFestivals } from '../lib/todayBand.js';

export const DEITY_IMAGES = {
  jaya: '/images/deities/jaya.png',
  vijaya: '/images/deities/vijaya.png',
  garuda: '/images/deities/garuda.png',
  hanuman: '/images/deities/hanuman.png',
  sudarshan: '/images/deities/sudarshan-chakra.png',
  lakshmi: '/images/deities/lakshmi.png',
};

export const TEMPLE_IMAGES = {
  shikhara: '/images/temple/shikhara-night.png',
};

export const FESTIVAL_PREVIEW = getUpcomingFestivals(3);

export const DONATION_AMOUNTS = ['501', '1,100', '2,100', '5,100', '11,000', '21,000'];
