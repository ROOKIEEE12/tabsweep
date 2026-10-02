export interface SavedTab { url: string; title: string; pinned: boolean; group?: string }
export interface Session { id: string; name: string; createdAt: number; tabs: SavedTab[] }
export interface ReadLaterItem { url: string; title: string; addedAt: number }

async function get<T>(key: string, fallback: T): Promise<T> {
  const r = await chrome.storage.local.get(key);
  return (r[key] as T) ?? fallback;
}
const set = (key: string, value: unknown) => chrome.storage.local.set({ [key]: value });

export const getSessions = () => get<Session[]>("sessions", []);
export const saveSessions = (s: Session[]) => set("sessions", s);
export const getReadLater = () => get<ReadLaterItem[]>("readLater", []);
export const saveReadLater = (r: ReadLaterItem[]) => set("readLater", r);
