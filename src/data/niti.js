export const SUMMER_NITI = [
  { time: '5:00 AM', name: 'Temple Opens', odia: 'ମନ୍ଦିର ଖୋଲିବ', note: 'Temple doors open for devotees.' },
  { time: '5:30 AM', name: 'Mangla Aarti', odia: 'ମଙ୍ଗଳ ଆରତୀ', note: 'First aarti of the day.' },
  { time: '9:00 AM', name: 'Bala Dhupa', odia: 'ବାଳ ଧୂପ', note: 'Morning bhoga offering.' },
  { time: '12:30 PM', name: 'Madhyan Prasad Offering', odia: 'ମଧ୍ୟାହ୍ନ ପ୍ରସାଦ', note: 'Midday prasad offering.' },
  { time: '1:30 PM', name: 'Pahad (Sayana/Rest)', odia: 'ପାହାଡ଼ (ଶୟନ)', note: 'Deities rest; temple closed to public.' },
  { time: '4:00 PM', name: 'Temple Reopens', odia: 'ମନ୍ଦିର ପୁନଃ ଖୋଲିବ', note: 'Temple reopens after midday rest.' },
  { time: '7:00 PM', name: 'Evening Aarti', odia: 'ସନ୍ଧ୍ୟା ଆରତୀ', note: 'Evening lamp aarti.' },
  { time: '9:00 PM', name: 'Evening (Bhog) Prasad', odia: 'ସନ୍ଧ୍ୟା ଭୋଗ', note: 'Evening bhoga prasad offering.' },
  { time: '9:30 PM', name: 'Pahad (Sayana/Rest)', odia: 'ପାହାଡ଼ (ଶୟନ)', note: 'Final rest; temple closes for the night.' },
];

export const WINTER_NITI = [
  { time: '6:00 AM', name: 'Temple Opens', odia: 'ମନ୍ଦିର ଖୋଲିବ', note: 'Temple doors open for devotees.' },
  { time: '6:15 AM', name: 'Mangla Aarti', odia: 'ମଙ୍ଗଳ ଆରତୀ', note: 'First aarti of the day.' },
  { time: '9:00 AM', name: 'Bala Dhupa', odia: 'ବାଳ ଧୂପ', note: 'Morning bhoga offering.' },
  { time: '12:30 PM', name: 'Madhyan Prasad Offering', odia: 'ମଧ୍ୟାହ୍ନ ପ୍ରସାଦ', note: 'Midday prasad offering.' },
  { time: '1:30 PM', name: 'Pahad (Sayana/Rest)', odia: 'ପାହାଡ଼ (ଶୟନ)', note: 'Deities rest; temple closed to public.' },
  { time: '3:30 PM', name: 'Temple Reopens', odia: 'ମନ୍ଦିର ପୁନଃ ଖୋଲିବ', note: 'Temple reopens after midday rest.' },
  { time: '6:00 PM', name: 'Evening Aarti', odia: 'ସନ୍ଧ୍ୟା ଆରତୀ', note: 'Evening lamp aarti.' },
  { time: '8:30 PM', name: 'Evening (Bhog) Prasad', odia: 'ସନ୍ଧ୍ୟା ଭୋଗ', note: 'Evening bhoga prasad offering.' },
  { time: '9:00 PM', name: 'Pahad (Sayana/Rest)', odia: 'ପାହାଡ଼ (ଶୟନ)', note: 'Final rest; temple closes for the night.' },
];

export const TEMPLE_OPEN_HOURS = {
  summer: {
    morningOpen: 5 * 60,
    morningClose: 13 * 60 + 30,
    eveningOpen: 16 * 60,
    eveningClose: 21 * 60 + 30,
    opensLabel: '5:00 AM',
    closesLabel: '9:30 PM',
    manglaAarti: '5:30 AM',
  },
  winter: {
    morningOpen: 6 * 60,
    morningClose: 13 * 60 + 30,
    eveningOpen: 15 * 60 + 30,
    eveningClose: 21 * 60,
    opensLabel: '6:00 AM',
    closesLabel: '9:00 PM',
    manglaAarti: '6:15 AM',
  },
};

import { getIstParts } from '../lib/ist.js';

export function getNitiSeason(now = new Date()) {
  const month = getIstParts(now).month;
  return month >= 3 && month <= 9 ? 'summer' : 'winter';
}

export function isTempleOpenBySchedule(now = new Date()) {
  const season = getNitiSeason(now);
  const mins = getIstParts(now).minutesSinceMidnight;
  const hours = TEMPLE_OPEN_HOURS[season];
  return (
    (mins >= hours.morningOpen && mins < hours.morningClose) ||
    (mins >= hours.eveningOpen && mins < hours.eveningClose)
  );
}

export const DEITY_MANTRA = {
  left: {
    image: '/images/deities/garuda.png',
    alt: 'Garuda Maharaja',
    odia: 'ଗରୁଡ଼ ମହାରାଜା',
  },
  right: {
    image: '/images/deities/hanuman.png',
    alt: 'Hanuman Bajrangbali',
    odia: 'ବଜରଙ୍ଗବଳୀ',
  },
  odia: 'ଜଗନ୍ନାଥ ସ୍ୱାମୀ ନୟନ ପଥଗାମୀ ଭବତୁ ମେ ।',
  roman: 'jagannātha swāmī nayana pathagāmī bhavatu me',
  meaning: '"May Lord Jagannath be the object of my vision — may He ever come into my sight."',
};
