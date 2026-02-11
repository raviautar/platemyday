const ANONYMOUS_ID_KEY = 'platemyday-anonymous-id';

export function getAnonymousId(): string {
  if (typeof window === 'undefined') return '';

  let id = localStorage.getItem(ANONYMOUS_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(ANONYMOUS_ID_KEY, id);
  }
  return id;
}

export function clearAnonymousId(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ANONYMOUS_ID_KEY);
}
