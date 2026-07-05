/** In-memory rath GPS — no database required. */
let rathLocation = {
  lat: null,
  lng: null,
  updatedAt: null,
};

export function getRathLocation() {
  return { ...rathLocation };
}

export function setRathLocation(lat, lng) {
  rathLocation = {
    lat,
    lng,
    updatedAt: new Date().toISOString(),
  };
}

export function clearRathLocation() {
  rathLocation = {
    lat: null,
    lng: null,
    updatedAt: null,
  };
}
