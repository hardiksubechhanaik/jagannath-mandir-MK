const VOLUNTEER_TOKEN_KEY = 'mandir_rath_wall_volunteer_token';

export function getVolunteerSession() {
  return sessionStorage.getItem(VOLUNTEER_TOKEN_KEY);
}

export function setVolunteerSession(token) {
  sessionStorage.setItem(VOLUNTEER_TOKEN_KEY, token);
}

export function clearVolunteerSession() {
  sessionStorage.removeItem(VOLUNTEER_TOKEN_KEY);
}
