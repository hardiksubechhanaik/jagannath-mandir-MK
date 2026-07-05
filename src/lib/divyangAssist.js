const CHANNEL = 'divyang-assist';
export const DIVYANG_LOCAL_KEY = 'mandir_divyang_requests';

export function notifyDivyangAssistUpdate() {
  try {
    const channel = new BroadcastChannel(CHANNEL);
    channel.postMessage('update');
    channel.close();
  } catch {
    // BroadcastChannel not available
  }
}

export function subscribeDivyangAssistUpdates(callback) {
  let channel;
  try {
    channel = new BroadcastChannel(CHANNEL);
    channel.onmessage = () => callback();
  } catch {
    // ignore
  }

  function onStorage(event) {
    if (event.key === DIVYANG_LOCAL_KEY) callback();
  }
  window.addEventListener('storage', onStorage);

  return () => {
    channel?.close();
    window.removeEventListener('storage', onStorage);
  };
}

function readAllLocalDivyangRequests() {
  try {
    return JSON.parse(localStorage.getItem(DIVYANG_LOCAL_KEY) ?? '[]');
  } catch {
    return [];
  }
}

function writeAllLocalDivyangRequests(list) {
  localStorage.setItem(DIVYANG_LOCAL_KEY, JSON.stringify(list.slice(0, 50)));
}

export function readLocalDivyangRequests() {
  return readAllLocalDivyangRequests().filter((entry) => entry.status === 'pending');
}

export function saveDivyangRequestLocally(request) {
  const list = readAllLocalDivyangRequests();
  const index = list.findIndex((entry) => entry.id === request.id);
  if (index >= 0) list[index] = request;
  else list.unshift(request);
  writeAllLocalDivyangRequests(list);
  notifyDivyangAssistUpdate();
  return request;
}

export function pushLocalDivyangRequest(phone) {
  return saveDivyangRequestLocally({
    id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    phone,
    createdAt: new Date().toISOString(),
    status: 'pending',
  });
}

export function dismissLocalDivyangRequest(id) {
  const list = readAllLocalDivyangRequests().map((entry) => (
    entry.id === id
      ? { ...entry, status: 'dismissed', dismissedAt: new Date().toISOString() }
      : entry
  ));
  writeAllLocalDivyangRequests(list);
  notifyDivyangAssistUpdate();
}

export function formatAssistTime(iso) {
  try {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}
